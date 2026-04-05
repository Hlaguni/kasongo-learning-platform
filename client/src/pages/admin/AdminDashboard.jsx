import { useEffect, useMemo, useState } from "react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorMessage from "../../components/common/ErrorMessage";
import DashboardStats from "../../components/admin/DashboardStats";
import { getAllResults } from "../../api/resultApi";
import { getAllLessons } from "../../api/lessonApi";
import { getAllSubjects } from "../../api/subjectApi";
import { getAllMCQs } from "../../api/mcqApi";

function AdminDashboard() {
  const [results, setResults] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [mcqs, setMcqs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [resultsData, lessonsData, subjectsData, mcqsData] =
          await Promise.all([
            getAllResults(),
            getAllLessons(),
            getAllSubjects(),
            getAllMCQs(),
          ]);

        setResults(
          Array.isArray(resultsData)
            ? resultsData
            : resultsData?.results || resultsData?.data || []
        );

        setLessons(
          Array.isArray(lessonsData)
            ? lessonsData
            : lessonsData?.lessons || lessonsData?.data || []
        );

        setSubjects(
          Array.isArray(subjectsData)
            ? subjectsData
            : subjectsData?.subjects || subjectsData?.data || []
        );

        setMcqs(
          Array.isArray(mcqsData)
            ? mcqsData
            : mcqsData?.mcqs || mcqsData?.data || []
        );
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError(
          err.response?.data?.message || "Failed to load admin dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const summary = useMemo(() => {
    const totalLessons = lessons.length;
    const totalSubjects = subjects.length;
    const totalMCQs = mcqs.length;
    const totalResults = results.length;

    const percentages = results.map((result) => {
      if (typeof result.percentage === "number") return result.percentage;

      const score = Number(result.score ?? 0);
      const totalQuestions = Number(result.totalQuestions ?? 0);

      if (totalQuestions === 0) return 0;
      return Math.round((score / totalQuestions) * 100);
    });

    const averageScore =
      percentages.length > 0
        ? Math.round(
            percentages.reduce((sum, value) => sum + value, 0) /
              percentages.length
          )
        : 0;

    const passedCount = percentages.filter((value) => value >= 50).length;
    const failedCount = percentages.filter((value) => value < 50).length;

    const passRate =
      percentages.length > 0
        ? Math.round((passedCount / percentages.length) * 100)
        : 0;

    const highestScore =
      percentages.length > 0 ? Math.max(...percentages) : 0;

    const lowestScore =
      percentages.length > 0 ? Math.min(...percentages) : 0;

    const scoreBands = {
      excellent: percentages.filter((value) => value >= 75).length,
      good: percentages.filter((value) => value >= 50 && value < 75).length,
      needsImprovement: percentages.filter((value) => value < 50).length,
    };

    const lessonsWithVideo = lessons.filter(
      (lesson) => lesson.videoUrl && lesson.videoUrl.trim() !== ""
    ).length;

    const lessonsWithPdf = lessons.filter(
      (lesson) => lesson.pdfUrl && lesson.pdfUrl.trim() !== ""
    ).length;

    const publishedLessons = lessons.filter(
      (lesson) => lesson.isPublished === true
    ).length;

    const publishedMcqs = mcqs.filter((mcq) => mcq.isPublished === true).length;

    const contentCompletionRate =
      totalLessons > 0
        ? Math.round(
            ((lessonsWithVideo + lessonsWithPdf) / (totalLessons * 2)) * 100
          )
        : 0;

    return {
      totalLessons,
      totalSubjects,
      totalMCQs,
      totalResults,
      averageScore,
      passRate,
      passedCount,
      failedCount,
      highestScore,
      lowestScore,
      lessonsWithVideo,
      lessonsWithPdf,
      publishedLessons,
      publishedMcqs,
      contentCompletionRate,
      scoreBands,
    };
  }, [results, lessons, subjects, mcqs]);

  const recentResults = useMemo(() => {
    return [...results]
      .sort(
        (a, b) =>
          new Date(b.attemptedAt || b.createdAt || 0) -
          new Date(a.attemptedAt || a.createdAt || 0)
      )
      .slice(0, 5);
  }, [results]);

  const subjectDistribution = useMemo(() => {
    const counts = {};

    lessons.forEach((lesson) => {
      const subjectName =
        lesson.subject?.name ||
        lesson.subjectName ||
        (typeof lesson.subject === "string" ? lesson.subject : "Unknown Subject");

      counts[subjectName] = (counts[subjectName] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [lessons]);

  const performanceHighlights = [
    {
      label: "Strongest Score",
      value: `${summary.highestScore}%`,
      tone: "text-green-700 bg-green-50 border-green-200",
    },
    {
      label: "Lowest Score",
      value: `${summary.lowestScore}%`,
      tone: "text-red-700 bg-red-50 border-red-200",
    },
    {
      label: "Passed Attempts",
      value: summary.passedCount,
      tone: "text-blue-700 bg-blue-50 border-blue-200",
    },
    {
      label: "Failed Attempts",
      value: summary.failedCount,
      tone: "text-amber-700 bg-amber-50 border-amber-200",
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Loading admin dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-slate-900 text-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300 mb-3">
              Platform Overview
            </p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">
              Kasongo Learning is building a measurable academic delivery system
            </h1>
            <p className="mt-4 text-slate-300 text-sm md:text-base leading-7">
              View content scale,
              assessment coverage, and learner performance.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-full xl:min-w-[360px]">
            <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
              <p className="text-slate-300 text-xs uppercase tracking-wide">
                Average Score
              </p>
              <p className="text-2xl font-bold mt-2">{summary.averageScore}%</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
              <p className="text-slate-300 text-xs uppercase tracking-wide">
                Pass Rate
              </p>
              <p className="text-2xl font-bold mt-2">{summary.passRate}%</p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
              <p className="text-slate-300 text-xs uppercase tracking-wide">
                Published Lessons
              </p>
              <p className="text-2xl font-bold mt-2">
                {summary.publishedLessons}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/10 p-4">
              <p className="text-slate-300 text-xs uppercase tracking-wide">
                Published MCQs
              </p>
              <p className="text-2xl font-bold mt-2">{summary.publishedMcqs}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <DashboardStats title="Total Lessons" value={summary.totalLessons} />
        <DashboardStats title="Total Results" value={summary.totalResults} />
        <DashboardStats title="Average Score" value={`${summary.averageScore}%`} />
        <DashboardStats title="Pass Rate" value={`${summary.passRate}%`} />
        <DashboardStats title="Total Subjects" value={summary.totalSubjects} />
        <DashboardStats title="Total MCQs" value={summary.totalMCQs} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Performance Snapshot
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                A quick executive summary of learner outcomes.
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Total Attempts
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.totalResults}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {performanceHighlights.map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border p-4 ${item.tone}`}
              >
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-2xl font-bold mt-2">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">Excellent (75%+)</span>
                <span className="font-semibold text-gray-900">
                  {summary.scoreBands.excellent}
                </span>
              </div>
              <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{
                    width: `${
                      summary.totalResults
                        ? (summary.scoreBands.excellent / summary.totalResults) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">Good (50% - 74%)</span>
                <span className="font-semibold text-gray-900">
                  {summary.scoreBands.good}
                </span>
              </div>
              <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{
                    width: `${
                      summary.totalResults
                        ? (summary.scoreBands.good / summary.totalResults) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">
                  Needs Improvement (&lt;50%)
                </span>
                <span className="font-semibold text-gray-900">
                  {summary.scoreBands.needsImprovement}
                </span>
              </div>
              <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-500"
                  style={{
                    width: `${
                      summary.totalResults
                        ? (summary.scoreBands.needsImprovement /
                            summary.totalResults) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Content Readiness
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Shows how prepared your content system is for scale.
          </p>

          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm text-gray-500">Lessons with Video</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.lessonsWithVideo}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm text-gray-500">Lessons with PDF</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.lessonsWithPdf}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm text-gray-500">Published Lessons</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.publishedLessons}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-sm text-gray-500">Published MCQs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.publishedMcqs}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-blue-800">
                Content Completion
              </p>
              <p className="text-sm font-bold text-blue-900">
                {summary.contentCompletionRate}%
              </p>
            </div>
            <div className="h-3 rounded-full bg-blue-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${summary.contentCompletionRate}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Subject Content Distribution
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Which subjects currently hold the most lesson content.
              </p>
            </div>
          </div>

          {subjectDistribution.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 text-center text-gray-500">
              No subject lesson data available yet.
            </div>
          ) : (
            <div className="space-y-4">
              {subjectDistribution.map((subject) => {
                const maxCount = subjectDistribution[0]?.count || 1;
                const width = Math.max((subject.count / maxCount) * 100, 8);

                return (
                  <div key={subject.name}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">
                        {subject.name}
                      </p>
                      <p className="text-sm font-semibold text-gray-900">
                        {subject.count} lessons
                      </p>
                    </div>

                    <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-slate-900"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Recent Assessment Activity
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Latest learner performance events on the platform.
              </p>
            </div>
          </div>

          {recentResults.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 text-center text-gray-500">
              No recent results available yet.
            </div>
          ) : (
            <div className="space-y-4">
              {recentResults.map((result, index) => {
                const score =
                  typeof result.percentage === "number"
                    ? result.percentage
                    : Number(result.totalQuestions ?? 0) > 0
                    ? Math.round(
                        (Number(result.score ?? 0) /
                          Number(result.totalQuestions ?? 1)) *
                          100
                      )
                    : 0;

                const studentName =
                  result.student?.name || result.studentName || "Student";
                const lessonTitle =
                  result.lesson?.title || result.lessonTitle || "Lesson";
                const attemptedAt = result.attemptedAt || result.createdAt;

                return (
                  <div
                    key={result._id || index}
                    className="rounded-2xl border border-gray-200 p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {studentName}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {lessonTitle}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {attemptedAt
                            ? new Date(attemptedAt).toLocaleString()
                            : "No date available"}
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          score >= 75
                            ? "bg-green-100 text-green-700"
                            : score >= 50
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {score}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;