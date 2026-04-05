import { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import SearchInput from "../../components/common/SearchInput";
import StatCard from "../../components/common/StatCard";
import EnrollmentsTable from "../../components/admin/EnrollmentsTable";
import EnrollmentForm from "../../components/admin/EnrollmentForm";

import { getAllEnrollments } from "../../api/enrollmentApi";
import { getAllStudents } from "../../api/userApi";
import { getAllGrades } from "../../api/gradeApi";
import { getAllSubjects } from "../../api/subjectApi";

function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================= FETCH =================
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");

      const [enrollmentsRes, studentsRes, gradesRes, subjectsRes] =
        await Promise.all([
          getAllEnrollments(),
          getAllStudents(),
          getAllGrades(),
          getAllSubjects(),
        ]);

      const extract = (data, key) =>
        Array.isArray(data)
          ? data
          : Array.isArray(data?.[key])
          ? data[key]
          : Array.isArray(data?.data)
          ? data.data
          : [];

      setEnrollments(extract(enrollmentsRes, "enrollments"));
      setStudents(extract(studentsRes, "students"));
      setGrades(extract(gradesRes, "grades"));
      setSubjects(extract(subjectsRes, "subjects"));
    } catch (err) {
      console.error(err);
      setError("Failed to load enrollment data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ================= SEARCH =================
  const searchedEnrollments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return enrollments;

    return enrollments.filter((e) => {
      const student = e.student?.name?.toLowerCase() || "";
      const subject = e.subject?.name?.toLowerCase() || "";
      const grade = e.grade?.name?.toLowerCase() || "";
      const payment = e.paymentStatus?.toLowerCase() || "";
      const access = e.accessStatus?.toLowerCase() || "";

      return (
        student.includes(query) ||
        subject.includes(query) ||
        grade.includes(query) ||
        payment.includes(query) ||
        access.includes(query)
      );
    });
  }, [enrollments, searchTerm]);

  // ================= FILTER =================
  const filteredEnrollments = useMemo(() => {
    if (activeFilter === "all") return searchedEnrollments;

    return searchedEnrollments.filter((e) => {
      if (activeFilter === "paid") return e.paymentStatus === "paid";
      if (activeFilter === "pending") return e.paymentStatus === "pending";
      if (activeFilter === "active") return e.accessStatus === "active";
      if (activeFilter === "expired") return e.accessStatus === "expired";
      return true;
    });
  }, [searchedEnrollments, activeFilter]);

  // ================= STATS =================
  const summary = useMemo(() => {
    return {
      total: enrollments.length,
      paid: enrollments.filter((e) => e.paymentStatus === "paid").length,
      active: enrollments.filter((e) => e.accessStatus === "active").length,
      revenue: enrollments.reduce(
        (sum, e) => sum + Number(e.amountPaid ?? 0),
        0
      ),
    };
  }, [enrollments]);

  if (loading) return <LoadingSpinner message="Loading enrollments..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Enrollments" value={summary.total} />
        <StatCard title="Paid" value={summary.paid} />
        <StatCard title="Active Access" value={summary.active} />
        <StatCard title="Revenue" value={summary.revenue} />
      </div>

      {/* ================= SEARCH + FILTER ================= */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-4">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search enrollments..."
        />

        <div className="flex flex-wrap gap-2">
          {["all", "paid", "pending", "active", "expired"].map((key) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-4 py-2 rounded-full text-sm ${
                activeFilter === key
                  ? "bg-slate-900 text-white"
                  : "bg-gray-100"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* ================= CREATE ================= */}
      <EnrollmentForm
  students={students}
  grades={grades}
  subjects={subjects}
  enrollments={enrollments}
  onEnrollmentCreated={fetchAllData}
/>
      {/* ================= TABLE ================= */}
      <EnrollmentsTable
        enrollments={filteredEnrollments}
        onEnrollmentUpdated={fetchAllData}
      />
    </div>
  );
}

export default EnrollmentsPage;