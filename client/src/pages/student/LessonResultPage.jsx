import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";

function LessonResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const result = state?.result;

  if (!result) {
    return (
      <div className="p-6">
        <PageHeader
          title="Result"
          subtitle="No result data found"
          breadcrumbs={[
            { label: "Dashboard", to: "/student/dashboard" },
            { label: "Result" },
          ]}
        />

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
          <p className="text-gray-600 mb-4">
            No result data available. Please complete a quiz first.
          </p>

          <button
            onClick={() => navigate("/student/subjects")}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            Go to Subjects
          </button>
        </div>
      </div>
    );
  }

  const performance =
    result.percentage >= 75
      ? { label: "Excellent", color: "text-green-700", bg: "bg-green-50" }
      : result.percentage >= 50
      ? { label: "Good", color: "text-blue-700", bg: "bg-blue-50" }
      : { label: "Needs Improvement", color: "text-red-700", bg: "bg-red-50" };

  return (
    <div className="p-6">
      <PageHeader
        title="Lesson Result"
        subtitle={`${result.subject} • ${result.topic}`}
        breadcrumbs={[
          { label: "Dashboard", to: "/student/dashboard" },
          { label: "Result" },
        ]}
      />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {result.lessonTitle}
        </h2>

        <div className="text-4xl font-bold text-gray-900 mb-2">
          {result.percentage}%
        </div>

        <p className="text-gray-600 mb-4">
          {result.score}/{result.totalQuestions} correct
        </p>

        <div
          className={`inline-block px-4 py-2 rounded-xl font-medium ${performance.bg} ${performance.color}`}
        >
          {performance.label}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/student/results")}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            View All Results
          </button>

          <button
            onClick={() => navigate(`/student/lessons/${result.lessonId}`)}
            className="px-4 py-2 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200"
          >
            Back to Lesson
          </button>
        </div>
      </div>

      {/* Question Review */}
      {result.submittedAnswers?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Question Review
          </h2>

          <div className="space-y-4">
            {result.submittedAnswers.map((item, index) => {
              const isCorrect = item.isCorrect;

              return (
                <div
                  key={index}
                  className={`rounded-2xl border p-4 ${
                    isCorrect
                      ? "border-green-200 bg-green-50"
                      : "border-red-200 bg-red-50"
                  }`}
                >
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {index + 1}. {item.questionText || "Question"}
                  </h3>

                  <p className="text-sm text-gray-700">
                    <strong>Your answer:</strong>{" "}
                    {item.selectedAnswer || "No answer"}
                  </p>

                  <p className="text-sm text-gray-700">
                    <strong>Correct answer:</strong>{" "}
                    {item.correctAnswer || "-"}
                  </p>

                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      isCorrect
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default LessonResultPage;