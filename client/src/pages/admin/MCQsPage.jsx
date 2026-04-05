import { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import SearchInput from "../../components/common/SearchInput";
import StatCard from "../../components/common/StatCard";
import ConfirmModal from "../../components/common/ConfirmModal";
import MCQsTable from "../../components/admin/MCQsTable";
import MCQForm from "../../components/admin/MCQForm";
import { getAllLessons } from "../../api/lessonApi";
import {
  createMCQ,
  deleteMCQ,
  getAllMCQs,
  toggleMCQActive,
  toggleMCQPublish,
  updateMCQ,
} from "../../api/mcqApi";

function MCQsPage() {
  const [mcqs, setMcqs] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingMCQ, setEditingMCQ] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mcqToDelete, setMcqToDelete] = useState(null);

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

      const [mcqData, lessonData] = await Promise.all([
        getAllMCQs(),
        getAllLessons(),
      ]);

      setMcqs(extractArray(mcqData, "mcqs"));
      setLessons(extractArray(lessonData, "lessons"));
    } catch (err) {
      console.error("Failed to load MCQs:", err);
      setError(err.response?.data?.message || "Failed to load MCQs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  const filteredMCQs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return mcqs;

    return mcqs.filter((mcq) => {
      const lesson =
        mcq.lesson?.title?.toLowerCase() ||
        mcq.lessonTitle?.toLowerCase() ||
        "";
      const topic =
        mcq.lesson?.topic?.name?.toLowerCase() ||
        mcq.topic?.name?.toLowerCase() ||
        mcq.topicName?.toLowerCase() ||
        "";
      const subject =
        mcq.lesson?.subject?.name?.toLowerCase() ||
        mcq.subject?.name?.toLowerCase() ||
        mcq.subjectName?.toLowerCase() ||
        "";
      const instructions = mcq.instructions?.toLowerCase() || "";

      return (
        lesson.includes(query) ||
        topic.includes(query) ||
        subject.includes(query) ||
        instructions.includes(query)
      );
    });
  }, [mcqs, searchTerm]);

  const summary = useMemo(() => {
    const totalMCQs = mcqs.length;
    const totalQuestions = mcqs.reduce(
      (sum, mcq) => sum + (mcq.questions?.length || 0),
      0
    );
    const publishedMCQs = mcqs.filter((mcq) => !!mcq.isPublished).length;
    const activeMCQs = mcqs.filter((mcq) => !!mcq.isActive).length;

    return {
      totalMCQs,
      totalQuestions,
      publishedMCQs,
      activeMCQs,
    };
  }, [mcqs]);

  const handleOpenCreate = () => {
    setEditingMCQ(null);
    setShowForm(true);
  };

  const handleOpenEdit = (mcq) => {
    setEditingMCQ(mcq);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMCQ(null);
  };

  const handleSubmitMCQ = async (formData) => {
    try {
      setSubmitting(true);
      setError("");

      if (editingMCQ?._id) {
        await updateMCQ(editingMCQ._id, formData);
      } else {
        await createMCQ(formData);
      }

      await fetchPageData();
      handleCloseForm();
    } catch (err) {
      console.error("Failed to save MCQ:", err);
      setError(err.response?.data?.message || "Failed to save MCQ.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (mcq) => {
    try {
      setError("");
      await toggleMCQPublish(mcq);
      await fetchPageData();
    } catch (err) {
      console.error("Failed to toggle publish state:", err);
      setError(err.response?.data?.message || "Failed to update publish status.");
    }
  };

  const handleToggleActive = async (mcq) => {
    try {
      setError("");
      await toggleMCQActive(mcq);
      await fetchPageData();
    } catch (err) {
      console.error("Failed to toggle active state:", err);
      setError(err.response?.data?.message || "Failed to update active status.");
    }
  };

  const handleAskDelete = (mcq) => {
    setMcqToDelete(mcq);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!mcqToDelete?._id) return;

    try {
      setSubmitting(true);
      setError("");

      await deleteMCQ(mcqToDelete._id);
      await fetchPageData();

      setShowDeleteModal(false);
      setMcqToDelete(null);
    } catch (err) {
      console.error("Failed to delete MCQ:", err);
      setError(err.response?.data?.message || "Failed to delete MCQ.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setMcqToDelete(null);
  };

  if (loading) {
    return <LoadingSpinner message="Loading MCQs..." />;
  }

  return (
    <div className="space-y-6">
      {error ? <ErrorMessage message={error} /> : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total MCQs" value={summary.totalMCQs} />
        <StatCard title="Total Questions" value={summary.totalQuestions} />
        <StatCard title="Published" value={summary.publishedMCQs} />
        <StatCard title="Active" value={summary.activeMCQs} />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
          <div className="flex-1">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by lesson, topic, subject, or instructions..."
            />
          </div>

          <button
            onClick={handleOpenCreate}
            className="px-5 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            Add MCQ
          </button>
        </div>

        {showForm ? (
          <div className="border-t border-gray-200 pt-4">
            <MCQForm
              initialData={editingMCQ}
              lessons={lessons}
              onSubmit={handleSubmitMCQ}
              onCancel={handleCloseForm}
              submitting={submitting}
            />
          </div>
        ) : null}
      </div>

      {filteredMCQs.length === 0 ? (
        <EmptyState
          title="No MCQs found"
          message={
            searchTerm
              ? "No MCQs match your search."
              : "There are no MCQs available yet."
          }
        />
      ) : (
        <MCQsTable
          mcqs={filteredMCQs}
          onEdit={handleOpenEdit}
          onDelete={handleAskDelete}
          onTogglePublish={handleTogglePublish}
          onToggleActive={handleToggleActive}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete MCQ"
        message={`Are you sure you want to delete the MCQ for "${
          mcqToDelete?.lesson?.title || mcqToDelete?.lessonTitle || "this lesson"
        }"? This action cannot be undone.`}
        confirmText={submitting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

export default MCQsPage;