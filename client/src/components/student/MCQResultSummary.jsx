function MCQResultSummary({ score, totalQuestions }) {
  const percentage =
    totalQuestions > 0
      ? Math.round((score / totalQuestions) * 100)
      : 0;

  const getPerformance = () => {
    if (percentage >= 75) {
      return {
        label: "Excellent",
        color: "text-green-700",
        bg: "bg-green-50",
      };
    } else if (percentage >= 50) {
      return {
        label: "Good",
        color: "text-blue-700",
        bg: "bg-blue-50",
      };
    } else {
      return {
        label: "Needs Improvement",
        color: "text-red-700",
        bg: "bg-red-50",
      };
    }
  };

  const performance = getPerformance();

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Your Result
        </h2>
        <p className="text-gray-600 mt-1">
          Here is your performance summary for this quiz.
        </p>
      </div>

      {/* Score Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        
        <div className="rounded-xl bg-gray-50 p-4 text-center border">
          <p className="text-sm text-gray-500">Score</p>
          <p className="text-xl font-semibold text-gray-900">
            {score} / {totalQuestions}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 text-center border">
          <p className="text-sm text-gray-500">Percentage</p>
          <p className="text-xl font-semibold text-gray-900">
            {percentage}%
          </p>
        </div>

        <div
          className={`rounded-xl p-4 text-center border ${performance.bg}`}
        >
          <p className="text-sm text-gray-500">Performance</p>
          <p className={`text-xl font-semibold ${performance.color}`}>
            {performance.label}
          </p>
        </div>
      </div>

      {/* Feedback */}
      <div className="text-sm text-gray-600">
        {percentage >= 75 && (
          <p>Great work! You have a strong understanding of this topic.</p>
        )}
        {percentage >= 50 && percentage < 75 && (
          <p>
            Good effort. Review a few areas to strengthen your understanding.
          </p>
        )}
        {percentage < 50 && (
          <p>
            Keep practicing. Revisit the lesson and try again to improve your score.
          </p>
        )}
      </div>
    </div>
  );
}

export default MCQResultSummary;