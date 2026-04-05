import { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import SearchInput from "../../components/common/SearchInput";
import StatCard from "../../components/common/StatCard";
import {
  getAllTopics,
  createTopic,
  updateTopic,
  deleteTopic,
} from "../../api/topicApi";
import { getAllGrades } from "../../api/gradeApi";
import { getAllSubjects } from "../../api/subjectApi";

function TopicsPage() {
  const [topics, setTopics] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [term, setTerm] = useState(1);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      setError("");

      const [topicsData, gradesData, subjectsData] = await Promise.all([
        getAllTopics(),
        getAllGrades(),
        getAllSubjects(),
      ]);

      const extractedTopics = Array.isArray(topicsData)
        ? topicsData
        : Array.isArray(topicsData?.topics)
        ? topicsData.topics
        : Array.isArray(topicsData?.data)
        ? topicsData.data
        : [];

      const extractedGrades = Array.isArray(gradesData)
        ? gradesData
        : Array.isArray(gradesData?.grades)
        ? gradesData.grades
        : Array.isArray(gradesData?.data)
        ? gradesData.data
        : [];

      const extractedSubjects = Array.isArray(subjectsData)
        ? subjectsData
        : Array.isArray(subjectsData?.subjects)
        ? subjectsData.subjects
        : Array.isArray(subjectsData?.data)
        ? subjectsData.data
        : [];

      setTopics(extractedTopics);
      setGrades(extractedGrades);
      setSubjects(extractedSubjects);
    } catch (err) {
      console.error("Failed to load topics page data:", err);
      setError(err.response?.data?.message || "Failed to load topics.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const data = await getAllTopics();

      const extractedTopics = Array.isArray(data)
        ? data
        : Array.isArray(data?.topics)
        ? data.topics
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setTopics(extractedTopics);
    } catch (err) {
      console.error("Failed to refresh topics:", err);
      setError(err.response?.data?.message || "Failed to load topics.");
    }
  };

  const resetForm = () => {
    setName("");
    setGrade("");
    setSubject("");
    setTerm(1);
    setEditingId(null);
  };

  const filteredSubjectsForGrade = useMemo(() => {
    if (!grade) return [];

    return subjects.filter((subjectItem) => {
      const subjectGradeId =
        subjectItem.grade?._id ||
        subjectItem.grade?.id ||
        subjectItem.grade;

      return subjectGradeId === grade;
    });
  }, [subjects, grade]);

  const handleGradeChange = (e) => {
    const selectedGrade = e.target.value;
    setGrade(selectedGrade);
    setSubject("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !grade || !subject || !term) {
      alert("Please complete all fields.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: name.trim(),
        grade,
        subject,
        term: Number(term),
      };

      if (editingId) {
        await updateTopic(editingId, payload);
      } else {
        await createTopic(payload);
      }

      resetForm();
      await fetchTopics();
    } catch (err) {
      console.error("Failed to save topic:", err);
      alert(err.response?.data?.message || "Failed to save topic.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (topic) => {
    const topicGradeId = topic.grade?._id || topic.grade || "";
    const topicSubjectId = topic.subject?._id || topic.subject || "";

    setEditingId(topic._id);
    setName(topic.name || "");
    setGrade(topicGradeId);
    setSubject(topicSubjectId);
    setTerm(topic.term || 1);
  };

  const handleDelete = async (topicId) => {
    const confirmed = window.confirm("Delete this topic?");
    if (!confirmed) return;

    try {
      await deleteTopic(topicId);
      await fetchTopics();
    } catch (err) {
      console.error("Failed to delete topic:", err);
      alert(err.response?.data?.message || "Failed to delete topic.");
    }
  };

  const filteredTopics = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return topics;

    return topics.filter((topic) => {
      const topicName = topic.name?.toLowerCase() || "";
      const gradeName =
        topic.grade?.name?.toLowerCase() ||
        topic.grade?.title?.toLowerCase() ||
        (typeof topic.grade === "string" ? topic.grade.toLowerCase() : "");
      const subjectName =
        topic.subject?.name?.toLowerCase() ||
        (typeof topic.subject === "string" ? topic.subject.toLowerCase() : "");
      const termText = `term ${topic.term || ""}`.toLowerCase();

      return (
        topicName.includes(query) ||
        gradeName.includes(query) ||
        subjectName.includes(query) ||
        termText.includes(query)
      );
    });
  }, [topics, searchTerm]);

  const summary = useMemo(() => {
    const totalTopics = topics.length;

    const uniqueSubjects = new Set(
      topics.map(
        (topic) =>
          topic.subject?._id || topic.subject?.name || topic.subject
      )
    );

    const uniqueGrades = new Set(
      topics.map((topic) => topic.grade?._id || topic.grade?.name || topic.grade)
    );

    return {
      totalTopics,
      totalSubjects: [...uniqueSubjects].filter(Boolean).length,
      totalGrades: [...uniqueGrades].filter(Boolean).length,
      totalTerms: new Set(topics.map((topic) => topic.term).filter(Boolean)).size,
    };
  }, [topics]);

  if (loading) {
    return <LoadingSpinner message="Loading topics..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Topics" value={summary.totalTopics} />
        <StatCard title="Subjects Covered" value={summary.totalSubjects} />
        <StatCard title="Grades Covered" value={summary.totalGrades} />
        <StatCard title="Terms Used" value={summary.totalTerms} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-xl font-bold text-gray-900">
          {editingId ? "Edit Topic" : "Add Topic"}
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Create and manage topics under the correct grade, subject, and term.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Topic name e.g. Analytical Geometry"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <select
              value={grade}
              onChange={handleGradeChange}
              className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">Select grade</option>
              {grades.map((gradeItem) => (
                <option key={gradeItem._id} value={gradeItem._id}>
                  {gradeItem.name}
                </option>
              ))}
            </select>

            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={!grade}
              className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="">
                {grade ? "Select subject" : "Select grade first"}
              </option>
              {filteredSubjectsForGrade.map((subjectItem) => (
                <option key={subjectItem._id} value={subjectItem._id}>
                  {subjectItem.name}
                </option>
              ))}
            </select>

            <select
              value={term}
              onChange={(e) => setTerm(Number(e.target.value))}
              className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value={1}>Term 1</option>
              <option value={2}>Term 2</option>
              <option value={3}>Term 3</option>
              <option value={4}>Term 4</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting
                ? editingId
                  ? "Updating..."
                  : "Adding..."
                : editingId
                ? "Update Topic"
                : "Add Topic"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by topic, grade, subject, or term..."
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Topic
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Grade
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Subject
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Term
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredTopics.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-6 text-center text-sm text-gray-500"
                >
                  No topics found.
                </td>
              </tr>
            ) : (
              filteredTopics.map((topic) => (
                <tr key={topic._id} className="border-b border-gray-100">
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {topic.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {topic.grade?.name || topic.grade?.title || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {topic.subject?.name || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    Term {topic.term}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEdit(topic)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(topic._id)}
                        className="text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TopicsPage;