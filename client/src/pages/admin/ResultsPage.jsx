import { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import SearchInput from "../../components/common/SearchInput";
import StatCard from "../../components/common/StatCard";
import ResultsTable from "../../components/admin/ResultsTable";
import { getAllResults } from "../../api/resultApi";

function ResultsPage() {
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAllResults();

        const extractedResults = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data?.data)
          ? data.data
          : [];

        setResults(extractedResults);
      } catch (err) {
        console.error("Failed to load results:", err);
        setError(err.response?.data?.message || "Failed to load results.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const filteredResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return results;

    return results.filter((result) => {
      const studentName =
        result.student?.name?.toLowerCase() ||
        result.user?.name?.toLowerCase() ||
        result.studentName?.toLowerCase() ||
        "";

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
        studentName.includes(query) ||
        subjectName.includes(query) ||
        topicName.includes(query) ||
        lessonTitle.includes(query)
      );
    });
  }, [results, searchTerm]);

  const summary = useMemo(() => {
    const totalResults = results.length;

    const percentages = results.map((result) => {
      if (typeof result.percentage === "number") return result.percentage;

      const score = Number(result.score ?? 0);
      const totalQuestions = Number(result.totalQuestions ?? 0);

      if (totalQuestions === 0) return 0;
      return Math.round((score / totalQuestions) * 100);
    });

    const averageScore =
      totalResults > 0
        ? Math.round(
            percentages.reduce((sum, value) => sum + value, 0) / totalResults
          )
        : 0;

    const passedCount = percentages.filter((value) => value >= 50).length;

    const passRate =
      totalResults > 0
        ? Math.round((passedCount / totalResults) * 100)
        : 0;

    const excellentCount = percentages.filter((value) => value >= 75).length;

    return {
      totalResults,
      averageScore,
      passRate,
      excellentCount,
    };
  }, [results]);

  if (loading) {
    return <LoadingSpinner message="Loading results..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Results" value={summary.totalResults} />
        <StatCard title="Average Score" value={`${summary.averageScore}%`} />
        <StatCard title="Pass Rate" value={`${summary.passRate}%`} />
        <StatCard title="Excellent Results" value={summary.excellentCount} />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by student, subject, topic, or lesson..."
        />
      </div>

      <ResultsTable results={filteredResults} />
    </div>
  );
}

export default ResultsPage;