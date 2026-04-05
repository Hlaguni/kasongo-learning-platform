import { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import SearchInput from "../../components/common/SearchInput";
import StatCard from "../../components/common/StatCard";
import UsersTable from "../../components/admin/UsersTable";
import { getAllStudents, registerUser } from "../../api/userApi";

function UsersPage() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllStudents();

      const extractedStudents = Array.isArray(data)
        ? data
        : Array.isArray(data?.students)
        ? data.students
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setStudents(extractedStudents);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      setError(err?.response?.data?.message || "Failed to load students.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "student",
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      };

      await registerUser(payload);

      if (payload.role === "student") {
        await fetchStudents();
        setSuccessMessage("Student created successfully.");
      } else {
        setSuccessMessage(
          "Educator created successfully. Educators do not appear in the students table."
        );
      }

      resetForm();
      setShowCreateForm(false);
    } catch (err) {
      console.error("Failed to create user:", err);
      setError(err?.response?.data?.message || "Failed to create user.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    if (!term) return students;

    return students.filter((student) => {
      const name = student?.name?.toLowerCase() || "";
      const email = student?.email?.toLowerCase() || "";
      const role = student?.role?.toLowerCase() || "";

      return (
        name.includes(term) ||
        email.includes(term) ||
        role.includes(term)
      );
    });
  }, [students, searchTerm]);

  const totalStudents = students.length;
  const activeStudents = students.filter((student) => student?.isActive).length;
  const inactiveStudents = students.filter(
    (student) => !student?.isActive
  ).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {error ? <ErrorMessage message={error} /> : null}

      {successMessage ? (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-2xl px-4 py-3">
          {successMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Students" value={totalStudents} />
        <StatCard title="Active Students" value={activeStudents} />
        <StatCard title="Inactive Students" value={inactiveStudents} />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="w-full lg:max-w-md">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or role"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setShowCreateForm((prev) => !prev);
              setError("");
              setSuccessMessage("");
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            {showCreateForm ? "Close Form" : "Add User"}
          </button>
        </div>

        {showCreateForm ? (
          <form
            onSubmit={handleCreateUser}
            className="mb-6 border border-gray-200 rounded-2xl bg-gray-50 p-5"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Register New User
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="student">Student</option>
                  <option value="educator">Educator</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting ? "Creating..." : "Create User"}
              </button>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowCreateForm(false);
                  setError("");
                }}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <UsersTable users={filteredStudents} />
      </div>
    </div>
  );
}

export default UsersPage;