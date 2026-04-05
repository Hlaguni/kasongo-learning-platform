import { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import SearchInput from "../../components/common/SearchInput";
import StatCard from "../../components/common/StatCard";
import ConfirmModal from "../../components/common/ConfirmModal";
import LessonsTable from "../../components/admin/LessonsTable";
import LessonForm from "../../components/admin/LessonForm";
import {
  createLesson,
  deleteLesson,
  getAllLessons,
  toggleLessonActive,
  toggleLessonPublish,
  updateLesson,
} from "../../api/lessonApi";
import { getAllGrades } from "../../api/gradeApi";
import { getAllSubjects } from "../../api/subjectApi";
import { getAllTopics } from "../../api/topicApi";

function LessonsPage() {
  const [lessons, setLessons] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);

  const extractArray = (data, key) => {
    return Array.isArray(data)
      ? data
      : Array.isArray(data?.[key])
      ? data[key]
      : Array.isArray(data?.data)
      ? data.data
      : [];
  };

  const fetchPageData = async () => {
    try {
      setLoading(true);
      setError("");

      const [lessonData, gradeData, subjectData, topicData] = await Promise.all(
        [getAllLessons(), getAllGrades(), getAllSubjects(), getAllTopics()]
      );

      setLessons(extractArray(lessonData, "lessons"));
      setGrades(extractArray(gradeData, "grades"));
      setSubjects(extractArray(subjectData, "subjects"));
      setTopics(extractArray(topicData, "topics"));
    } catch (err) {
      console.error("Failed to load lesson page data:", err);
      setError(err.response?.data?.message || "Failed to load lesson data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  const filteredLessons = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return lessons;

    return lessons.filter((lesson) => {
      const title = lesson.title?.toLowerCase() || "";
      const topic =
        lesson.topic?.name?.toLowerCase() ||
        lesson.topicName?.toLowerCase() ||
        (typeof lesson.topic === "string" ? lesson.topic.toLowerCase() : "");
      const subject =
        lesson.subject?.name?.toLowerCase() ||
        lesson.topic?.subject?.name?.toLowerCase() ||
        lesson.subjectName?.toLowerCase() ||
        (typeof lesson.subject === "string" ? lesson.subject.toLowerCase() : "");
      const description = lesson.description?.toLowerCase() || "";

      return (
        title.includes(query) ||
        topic.includes(query) ||
        subject.includes(query) ||
        description.includes(query)
      );
    });
  }, [lessons, searchTerm]);

  const summary = useMemo(() => {
    const totalLessons = lessons.length;
    const lessonsWithPDF = lessons.filter((lesson) => !!lesson.pdfUrl).length;
    const lessonsWithVideo = lessons.filter(
      (lesson) => !!lesson.videoUrl
    ).length;
    const publishedLessons = lessons.filter(
      (lesson) => !!lesson.isPublished
    ).length;

    return {
      totalLessons,
      lessonsWithPDF,
      lessonsWithVideo,
      publishedLessons,
    };
  }, [lessons]);

  const handleOpenCreate = () => {
    setEditingLesson(null);
    setShowForm(true);
  };

  const handleOpenEdit = (lesson) => {
    setEditingLesson(lesson);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingLesson(null);
  };

  const handleSubmitLesson = async (formData) => {
    try {
      setSubmitting(true);
      setError("");

      if (editingLesson?._id) {
        await updateLesson(editingLesson._id, formData);
      } else {
        await createLesson(formData);
      }

      await fetchPageData();
      handleCloseForm();
    } catch (err) {
      console.error("Failed to save lesson:", err);
      setError(err.response?.data?.message || "Failed to save lesson.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (lesson) => {
    try {
      setError("");
      await toggleLessonPublish(lesson);
      await fetchPageData();
    } catch (err) {
      console.error("Failed to toggle publish state:", err);
      setError(
        err.response?.data?.message || "Failed to update publish status."
      );
    }
  };

  const handleToggleActive = async (lesson) => {
    try {
      setError("");
      await toggleLessonActive(lesson);
      await fetchPageData();
    } catch (err) {
      console.error("Failed to toggle active state:", err);
      setError(err.response?.data?.message || "Failed to update active status.");
    }
  };

  const handleAskDelete = (lesson) => {
    setLessonToDelete(lesson);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!lessonToDelete?._id) return;

    try {
      setSubmitting(true);
      setError("");

      await deleteLesson(lessonToDelete._id);
      await fetchPageData();

      setShowDeleteModal(false);
      setLessonToDelete(null);
    } catch (err) {
      console.error("Failed to delete lesson:", err);
      setError(err.response?.data?.message || "Failed to delete lesson.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setLessonToDelete(null);
  };

  if (loading) {
    return <LoadingSpinner message="Loading lessons..." />;
  }

  return (
    <div className="space-y-6">
      {error ? <ErrorMessage message={error} /> : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Lessons" value={summary.totalLessons} />
        <StatCard title="Published" value={summary.publishedLessons} />
        <StatCard title="With PDF" value={summary.lessonsWithPDF} />
        <StatCard title="With Video" value={summary.lessonsWithVideo} />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by lesson, topic, subject, or description..."
            />
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            Add Lesson
          </button>
        </div>

        {showForm ? (
          <div className="border-t border-gray-200 pt-4">
            <LessonForm
              initialData={editingLesson}
              grades={grades}
              subjects={subjects}
              topics={topics}
              lessons={lessons}
              onSubmit={handleSubmitLesson}
              onCancel={handleCloseForm}
              submitting={submitting}
            />
          </div>
        ) : null}
      </div>

      {filteredLessons.length === 0 ? (
        <EmptyState
          title="No lessons found"
          message={
            searchTerm
              ? "No lessons match your search."
              : "There are no lessons available yet."
          }
        />
      ) : (
        <LessonsTable
          lessons={filteredLessons}
          onEdit={handleOpenEdit}
          onDelete={handleAskDelete}
          onTogglePublish={handleTogglePublish}
          onToggleActive={handleToggleActive}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Lesson"
        message={`Are you sure you want to delete "${
          lessonToDelete?.title || "this lesson"
        }"? This action cannot be undone.`}
        confirmText={submitting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

export default LessonsPage;