function StudentResultsTable({ results = [] }) {
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
      <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Results History</h2>
        <p className="text-sm text-gray-500 mt-1">
          View your quiz performance by subject, topic, and lesson.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-white border-b border-gray-200">
            <tr>
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
            </tr>
          </thead>

          <tbody>
            {results.map((result, index) => {
              const percentage = getPercentage(result);

              const attemptedAt = result.attemptedAt
                ? new Date(result.attemptedAt).toLocaleDateString()
                : "—";

              return (
                <tr
                  key={result._id || index}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                    {result.subject?.name || result.subjectName || "—"}
                  </td>

                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                    {result.topic?.name || result.topicName || "—"}
                  </td>

                  <td className="px-4 py-4 text-gray-700 min-w-[220px]">
                    {result.lesson?.title ||
                      result.lessonTitle ||
                      result.lessonName ||
                      "—"}
                  </td>

                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                    {result.score ?? 0}/{result.totalQuestions ?? 0}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getBadgeClass(
                        percentage
                      )}`}
                    >
                      {percentage}%
                    </span>
                  </td>

                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                    {attemptedAt}
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

export default StudentResultsTable;