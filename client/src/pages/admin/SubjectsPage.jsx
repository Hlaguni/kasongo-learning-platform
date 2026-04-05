import { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import SearchInput from "../../components/common/SearchInput";
import StatCard from "../../components/common/StatCard";
import {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../../api/subjectApi";
import { getAllGrades } from "../../api/gradeApi";

function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [isActive, setIsActive] = useState(true);
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

      const [subjectsData, gradesData] = await Promise.all([
        getAllSubjects(),
        getAllGrades(),
      ]);

      const extractedSubjects = Array.isArray(subjectsData)
        ? subjectsData
        : Array.isArray(subjectsData?.subjects)
        ? subjectsData.subjects
        : Array.isArray(subjectsData?.data)
        ? subjectsData.data
        : [];

      const extractedGrades = Array.isArray(gradesData)
        ? gradesData
        : Array.isArray(gradesData?.grades)
        ? gradesData.grades
        : Array.isArray(gradesData?.data)
        ? gradesData.data
        : [];

      setSubjects(extractedSubjects);
      setGrades(extractedGrades);
    } catch (err) {
      console.error("Failed to load subjects page data:", err);
      setError(err.response?.data?.message || "Failed to load subjects.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const data = await getAllSubjects();

      const extractedSubjects = Array.isArray(data)
        ? data
        : Array.isArray(data?.subjects)
        ? data.subjects
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setSubjects(extractedSubjects);
    } catch (err) {
      console.error("Failed to refresh subjects:", err);
      setError(err.response?.data?.message || "Failed to load subjects.");
    }
  };

  const resetForm = () => {
    setName("");
    setGrade("");
    setIsActive(true);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !grade) {
      alert("Please enter subject name and select a grade.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: name.trim(),
        grade,
        isActive,
      };

      if (editingId) {
        await updateSubject(editingId, payload);
      } else {
        await createSubject(payload);
      }

      resetForm();
      await fetchSubjects();
    } catch (err) {
      console.error("Failed to save subject:", err);
      alert(err.response?.data?.message || "Failed to save subject.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (subject) => {
    setEditingId(subject._id);
    setName(subject.name || "");
    setGrade(subject.grade?._id || subject.grade || "");
    setIsActive(subject.isActive ?? true);
  };

  const handleDelete = async (subjectId) => {
    const confirmed = window.confirm("Delete this subject?");
    if (!confirmed) return;

    try {
      await deleteSubject(subjectId);
      await fetchSubjects();
    } catch (err) {
      console.error("Failed to delete subject:", err);
      alert(err.response?.data?.message || "Failed to delete subject.");
    }
  };

  const filteredSubjects = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return subjects;

    return subjects.filter((subject) => {
      const name = subject.name?.toLowerCase() || "";
      const gradeName =
        subject.grade?.name?.toLowerCase() ||
        subject.grade?.title?.toLowerCase() ||
        subject.gradeName?.toLowerCase() ||
        (typeof subject.grade === "string" ? subject.grade.toLowerCase() : "");

      return name.includes(query) || gradeName.includes(query);
    });
  }, [subjects, searchTerm]);

  const summary = useMemo(() => {
    const totalSubjects = subjects.length;
    const activeSubjects = subjects.filter(
      (subject) => subject.isActive ?? true
    ).length;
    const inactiveSubjects = totalSubjects - activeSubjects;

    const uniqueGrades = new Set(
      subjects.map(
        (subject) =>
          subject.grade?._id ||
          subject.grade?.name ||
          subject.grade?.title ||
          subject.gradeName ||
          subject.grade
      )
    );

    return {
      totalSubjects,
      activeSubjects,
      inactiveSubjects,
      totalGrades: [...uniqueGrades].filter(Boolean).length,
    };
  }, [subjects]);

  if (loading) {
    return <LoadingSpinner message="Loading subjects..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Subjects" value={summary.totalSubjects} />
        <StatCard title="Active Subjects" value={summary.activeSubjects} />
        <StatCard title="Inactive Subjects" value={summary.inactiveSubjects} />
        <StatCard title="Grades Covered" value={summary.totalGrades} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-xl font-bold text-gray-900">
          {editingId ? "Edit Subject" : "Add Subject"}
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Create and manage subjects under the correct grade.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Subject name e.g. Mathematics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">Select grade</option>
              {grades.map((gradeItem) => (
                <option key={gradeItem._id} value={gradeItem._id}>
                  {gradeItem.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="subject-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="subject-active" className="text-sm text-gray-700">
              Subject is active
            </label>
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
                ? "Update Subject"
                : "Add Subject"}
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
          placeholder="Search by subject or grade..."
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Grade
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredSubjects.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-6 text-center text-sm text-gray-500"
                >
                  No subjects found.
                </td>
              </tr>
            ) : (
              filteredSubjects.map((subject) => (
                <tr key={subject._id} className="border-b border-gray-100">
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {subject.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {subject.grade?.name ||
                      subject.grade?.title ||
                      subject.gradeName ||
                      "-"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        subject.isActive ?? true
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {subject.isActive ?? true ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subject._id)}
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

export default SubjectsPage;