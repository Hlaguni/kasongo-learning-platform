function LessonCard({ lesson, onClick }) {
  const hasDescription = lesson.description && lesson.description.trim() !== "";
  const hasPdf = !!lesson.pdfUrl;
  const hasVideo = !!lesson.videoUrl;
  const hasMcq = !!lesson.hasMCQ;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition duration-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-700 mb-2">
            Lesson {lesson.lessonNumber}
          </p>

          <h2 className="text-xl font-semibold text-gray-900 break-words">
            {lesson.title}
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            {hasDescription
              ? lesson.description
              : "Open this lesson to view video, notes, PDF, and assessment content."}
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                hasVideo
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {hasVideo ? "Video available" : "No video"}
            </span>

            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                hasPdf
                  ? "bg-red-50 text-red-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {hasPdf ? "PDF available" : "No PDF"}
            </span>

            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                hasMcq
                  ? "bg-purple-50 text-purple-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {hasMcq ? "Quiz available" : "No quiz"}
            </span>
          </div>
        </div>

        <div className="shrink-0">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Open
          </span>
        </div>
      </div>
    </button>
  );
}

export default LessonCard;