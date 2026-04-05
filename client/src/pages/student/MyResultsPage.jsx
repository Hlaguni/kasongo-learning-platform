import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import EmptyState from "../../components/common/EmptyState";
import StudentSummaryCard from "../../components/student/StudentSummaryCard";
import StudentResultsTable from "../../components/student/StudentResultsTable";
import { getMyResults } from "../../api/resultApi";

function MyResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyResults();

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

    const highestScore = totalResults > 0 ? Math.max(...percentages) : 0;

    const passedCount = percentages.filter((value) => value >= 50).length;

    const passRate =
      totalResults > 0
        ? Math.round((passedCount / totalResults) * 100)
        : 0;

    return {
      totalResults,
      averageScore,
      highestScore,
      passRate,
    };
  }, [results]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="My Results"
        subtitle="Track your quiz performance across lessons"
        breadcrumbs={[
          { label: "Dashboard", to: "/student/dashboard" },
          { label: "My Results" },
        ]}
      />

      {results.length === 0 ? (
        <EmptyState
          title="No results yet"
          message="Complete a lesson quiz and your results will appear here."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StudentSummaryCard
              title="Total Results"
              value={summary.totalResults}
              helperText="All attempts"
            />

            <StudentSummaryCard
              title="Average Score"
              value={`${summary.averageScore}%`}
              helperText="Across lessons"
            />

            <StudentSummaryCard
              title="Highest Score"
              value={`${summary.highestScore}%`}
              helperText="Best performance"
            />

            <StudentSummaryCard
              title="Pass Rate"
              value={`${summary.passRate}%`}
              helperText="50% and above"
            />
          </div>

          <StudentResultsTable results={results} />
        </>
      )}
    </div>
  );
}

export default MyResultsPage;