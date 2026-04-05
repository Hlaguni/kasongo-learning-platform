import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import SearchInput from "../../components/common/SearchInput";
import StatCard from "../../components/common/StatCard";
import StudentResultsTable from "../../components/student/StudentResultsTable";
import StudentSummaryCard from "../../components/student/StudentSummaryCard";
import { getResultsByStudent } from "../../api/resultApi";

function StudentResultsPage() {
  const { studentId } = useParams();

  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [performanceFilter, setPerformanceFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudentResults = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getResultsByStudent(studentId);

      const extractedResults = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setResults(extractedResults);
    } catch (err) {
      console.error("Failed to load student results:", err);
      setError(
        err?.response?.data?.message || "Failed to load student results."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchStudentResults();
    }
  }, [studentId]);

  const studentInfo = useMemo(() => {
    if (!results.length) return null;

    const firstResult = results[0];

    return (
      firstResult.student ||
      firstResult.user || {
        _id: studentId,
        name: firstResult.studentName || "Student",
        email: firstResult.studentEmail || "",
      }
    );
  }, [results, studentId]);

  const searchedResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return results;

    return results.filter((result) => {
      const subjectName =
        result.subject?.name?.toLowerCase() ||
        result.subjectName?.toLowerCase() ||
        (typeof result.subject === "string" ? result.subject.toLowerCase() : "");

      const topicName =
        result.topic?.name?.toLowerCase() ||
        result.topicName?.toLowerCase() ||
        (typeof result.topic === "string" ? result.topic.toLowerCase() : "");

      const lessonTitle =
        result.lesson?.title?.toLowerCase() ||
        result.lessonTitle?.toLowerCase() ||
        result.lessonName?.toLowerCase() ||
        "";

      return (
        subjectName.includes(query) ||
        topicName.includes(query) ||
        lessonTitle.includes(query)
      );
    });
  }, [results, searchTerm]);

  const filteredResults = useMemo(() => {
    const getPercentage = (result) => {
      if (typeof result.percentage === "number") return result.percentage;

      const score = Number(result.score ?? 0);
      const totalQuestions = Number(result.totalQuestions ?? 0);

      if (totalQuestions === 0) return 0;
      return Math.round((score / totalQuestions) * 100);
    };

    if (performanceFilter === "all") return searchedResults;

    return searchedResults.filter((result) => {
      const percentage = getPercentage(result);

      if (performanceFilter === "excellent") return percentage >= 75;
      if (performanceFilter === "good") {
        return percentage >= 50 && percentage < 75;
      }
      if (performanceFilter === "needs-improvement") return percentage < 50;

      return true;
    });
  }, [searchedResults, performanceFilter]);

  const summary = useMemo(() => {
    const totalResults = results.length;

    const percentages = results.map((result) => {
      if (typeof result.percentage === "number") return result.percentage;

      const score = Number(result.score ?? 0);
      const totalQuestions = Number(result.totalQuestions ?? 0);

      if (totalQuestions === 0) return 0;
      return Math.round((score / totalQuestions) * 100);
    });

    const averagePercentage =
      totalResults > 0
        ? Math.round(
            percentages.reduce((sum, value) => sum + value, 0) / totalResults
          )
        : 0;

    const bestPercentage =
      percentages.length > 0 ? Math.max(...percentages) : 0;

    const passCount = percentages.filter((value) => value >= 50).length;

    const passRate =
      totalResults > 0
        ? Math.round((passCount / totalResults) * 100)
        : 0;

    return {
      totalResults,
      averagePercentage,
      bestPercentage,
      passRate,
    };
  }, [results]);

  const performanceOptions = [
    { key: "all", label: "All" },
    { key: "excellent", label: "Excellent" },
    { key: "good", label: "Good" },
    { key: "needs-improvement", label: "Needs Improvement" },
  ];

  if (loading) {
    return <LoadingSpinner message="Loading student results..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <StudentSummaryCard
        student={studentInfo}
        totalResults={summary.totalResults}
        averagePercentage={summary.averagePercentage}
        bestPercentage={summary.bestPercentage}
        passRate={summary.passRate}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Results" value={summary.totalResults} />
        <StatCard title="Average Score" value={`${summary.averagePercentage}%`} />
        <StatCard title="Best Score" value={`${summary.bestPercentage}%`} />
        <StatCard title="Pass Rate" value={`${summary.passRate}%`} />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-4">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by subject, topic, or lesson..."
        />

        <div className="flex flex-wrap gap-2">
          {performanceOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setPerformanceFilter(option.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                performanceFilter === option.key
                  ? "bg-slate-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <StudentResultsTable results={filteredResults} />
    </div>
  );
}

export default StudentResultsPage;