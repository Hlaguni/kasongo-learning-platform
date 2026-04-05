import { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import SearchInput from "../../components/common/SearchInput";
import StatCard from "../../components/common/StatCard";
import {
  getAllGrades,
  createGrade,
  updateGrade,
  deleteGrade,
} from "../../api/gradeApi";

function GradesPage() {
  const [grades, setGrades] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllGrades();

      const extractedGrades = Array.isArray(data)
        ? data
        : Array.isArray(data?.grades)
        ? data.grades
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setGrades(extractedGrades);
    } catch (err) {
      console.error("Failed to load grades:", err);
      setError(err.response?.data?.message || "Failed to load grades.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setValue("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || value === "") {
      alert("Please fill in both grade name and grade value.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: name.trim(),
        value: Number(value),
      };

      if (editingId) {
        await updateGrade(editingId, payload);
      } else {
        await createGrade(payload);
      }

      resetForm();
      fetchGrades();
    } catch (err) {
      console.error("Failed to save grade:", err);
      alert(err.response?.data?.message || "Failed to save grade.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (grade) => {
    setEditingId(grade._id);
    setName(grade.name || "");
    setValue(grade.value ?? "");
  };

  const handleDelete = async (gradeId) => {
    const confirmed = window.confirm("Delete this grade?");
    if (!confirmed) return;

    try {
      await deleteGrade(gradeId);
      fetchGrades();
    } catch (err) {
      console.error("Failed to delete grade:", err);
      alert(err.response?.data?.message || "Failed to delete grade.");
    }
  };

  const filteredGrades = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return grades;

    return grades.filter((grade) => {
      const gradeName = grade.name?.toLowerCase() || "";
      const gradeValue = String(grade.value ?? "").toLowerCase();

      return gradeName.includes(query) || gradeValue.includes(query);
    });
  }, [grades, searchTerm]);

  const summary = useMemo(() => {
    const totalGrades = grades.length;

    const sortedValues = grades
      .map((grade) => Number(grade.value))
      .filter((value) => !Number.isNaN(value))
      .sort((a, b) => a - b);

    return {
      totalGrades,
      lowestGrade: sortedValues.length ? sortedValues[0] : "-",
      highestGrade: sortedValues.length
        ? sortedValues[sortedValues.length - 1]
        : "-",
    };
  }, [grades]);

  if (loading) {
    return <LoadingSpinner message="Loading grades..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard title="Total Grades" value={summary.totalGrades} />
        <StatCard title="Lowest Grade" value={summary.lowestGrade} />
        <StatCard title="Highest Grade" value={summary.highestGrade} />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {editingId ? "Edit Grade" : "Add Grade"}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Create and manage the grades available on the platform.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Grade name e.g. Grade 10"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              type="number"
              placeholder="Grade value e.g. 10"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />
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
                ? "Update Grade"
                : "Add Grade"}
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

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by grade name or value..."
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200 text-left">
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Name
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Value
              </th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredGrades.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="px-6 py-6 text-sm text-gray-500 text-center"
                >
                  No grades found.
                </td>
              </tr>
            ) : (
              filteredGrades.map((grade) => (
                <tr key={grade._id} className="border-b border-gray-100">
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {grade.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {grade.value}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleEdit(grade)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(grade._id)}
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

export default GradesPage;