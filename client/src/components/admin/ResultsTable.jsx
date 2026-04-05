import { useNavigate } from "react-router-dom";

function ResultsTable({ results = [] }) {
  const navigate = useNavigate();

  const getPercentage = (result) => {
    if (typeof result.percentage === "number") return result.percentage;

    const score = Number(result.score ?? 0);
    const totalQuestions = Number(result.totalQuestions ?? 0);

    if (totalQuestions === 0) return 0;
    return Math.round((score / totalQuestions) * 100);
  };

  const getBadgeClass = (percentage) => {
    if (percentage >= 75) return "bg-green-100 text-green-700";
    if (percentage >= 50) return "bg-blue-100 text-blue-700";
    return "bg-red-100 text-red-700";
  };

  if (!results.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center text-gray-500">
        No results found.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Student
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Subject
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Topic
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Lesson
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Score
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Percentage
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Attempted
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {results.map((result, index) => {
              const student =
                result.student || result.user || null;

              const studentId =
                student?._id ||
                (typeof result.student === "string" ? result.student : "") ||
                (typeof result.user === "string" ? result.user : "");

              const studentName =
                student?.name ||
                result.studentName ||
                "Unknown Student";

              const subjectName =
                result.subject?.name ||
                result.subjectName ||
                (typeof result.subject === "string" ? result.subject : "—");

              const topicName =
                result.topic?.name ||
                result.topicName ||
                (typeof result.topic === "string" ? result.topic : "—");

              const lessonTitle =
                result.lesson?.title ||
                result.lessonTitle ||
                result.lessonName ||
                "—";

              const score = Number(result.score ?? 0);
              const totalQuestions = Number(result.totalQuestions ?? 0);
              const percentage = getPercentage(result);

              const attemptedAt = result.attemptedAt
                ? new Date(result.attemptedAt).toLocaleDateString()
                : "—";

              return (
                <tr
                  key={result._id || `${studentId}-${index}`}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {studentName}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {subjectName}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {topicName}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {lessonTitle}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {score}/{totalQuestions}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getBadgeClass(
                        percentage
                      )}`}
                    >
                      {percentage}%
                    </span>
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {attemptedAt}
                  </td>

                  <td className="px-4 py-3">
                    {studentId ? (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/admin/results/student/${studentId}`)
                        }
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition"
                      >
                        View Student
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">Unavailable</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ResultsTable;