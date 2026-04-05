function TopicCard({ topic, onClick }) {
  const lessonsCount = topic.lessonsCount ?? 0;
  const quizzesCount = topic.quizzesCount ?? 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition duration-200"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold text-gray-900 break-words">
            {topic.name}
          </h2>

          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Explore lessons, videos, PDFs, and quizzes in this topic.
          </p>
        </div>

        <div className="shrink-0">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Open
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
        <div className="rounded-xl bg-gray-50 px-3 py-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Lessons</p>
          <p className="text-sm font-semibold text-gray-900">
            {lessonsCount}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 px-3 py-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Quizzes</p>
          <p className="text-sm font-semibold text-gray-900">
            {quizzesCount}
          </p>
        </div>
      </div>
    </button>
  );
}

export default TopicCard;