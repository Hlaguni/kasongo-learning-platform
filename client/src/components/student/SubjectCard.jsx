function SubjectCard({ subject, onClick }) {
  const topicsCount = subject.topicsCount ?? 0;
  const lessonsCount = subject.lessonsCount ?? 0;
  const quizzesCount = subject.quizzesCount ?? 0;
  const gradeName =
    subject.grade?.name ||
    subject.gradeName ||
    subject.grade ||
    "Grade not available";

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition duration-200"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-blue-700 mb-2">
            {gradeName}
          </p>

          <h2 className="text-xl font-semibold text-gray-900 break-words">
            {subject.name}
          </h2>

          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Open subject and view topics, lessons, and assessments.
          </p>
        </div>

        <div className="shrink-0">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Open
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
        <div className="rounded-xl bg-gray-50 px-3 py-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Topics</p>
          <p className="text-sm font-semibold text-gray-900">{topicsCount}</p>
        </div>

        <div className="rounded-xl bg-gray-50 px-3 py-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Lessons</p>
          <p className="text-sm font-semibold text-gray-900">{lessonsCount}</p>
        </div>

        <div className="rounded-xl bg-gray-50 px-3 py-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Quizzes</p>
          <p className="text-sm font-semibold text-gray-900">{quizzesCount}</p>
        </div>
      </div>
    </button>
  );
}

export default SubjectCard;