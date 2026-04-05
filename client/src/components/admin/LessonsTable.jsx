function LessonsTable({
  lessons = [],
  onEdit,
  onDelete,
  onTogglePublish,
  onToggleActive,
}) {
  const getTopicName = (lesson) => {
    return lesson.topic?.name || lesson.topicName || lesson.topic || "—";
  };

  const getSubjectName = (lesson) => {
    return (
      lesson.subject?.name ||
      lesson.topic?.subject?.name ||
      lesson.subjectName ||
      lesson.subject ||
      "—"
    );
  };

  const getCreatedDate = (lesson) => {
    if (!lesson.createdAt) return "—";
    return new Date(lesson.createdAt).toLocaleDateString();
  };

  const getBadgeClass = (value, positive = true) => {
    if (value && positive) return "bg-green-100 text-green-700";
    if (value && !positive) return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-600";
  };

  if (!lessons.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center text-gray-500">
        No lessons found.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-4 text-left font-semibold text-gray-700">
                Lesson
              </th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700">
                Topic
              </th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700">
                Subject
              </th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700">
                Term
              </th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700">
                Number
              </th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700">
                PDF
              </th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700">
                Video
              </th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700">
                Published
              </th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700">
                Active
              </th>
              <th className="px-4 py-4 text-left font-semibold text-gray-700">
                Created
              </th>
              <th className="px-4 py-4 text-right font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {lessons.map((lesson, index) => {
              const topicName = getTopicName(lesson);
              const subjectName = getSubjectName(lesson);
              const createdAt = getCreatedDate(lesson);

              return (
                <tr
                  key={lesson._id || lesson.id || `${lesson.title}-${index}`}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="min-w-[220px]">
                      <p className="font-semibold text-gray-900">
                        {lesson.title || "Untitled Lesson"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {lesson.description || "No description"}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                    {topicName}
                  </td>

                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                    {subjectName}
                  </td>

                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                    {lesson.term || "—"}
                  </td>

                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                    {lesson.lessonNumber ?? lesson.order ?? "—"}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getBadgeClass(
                        !!lesson.pdfUrl
                      )}`}
                    >
                      {lesson.pdfUrl ? "Available" : "None"}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getBadgeClass(
                        !!lesson.videoUrl
                      )}`}
                    >
                      {lesson.videoUrl ? "Available" : "None"}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getBadgeClass(
                        !!lesson.isPublished,
                        false
                      )}`}
                    >
                      {lesson.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        lesson.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {lesson.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                    {createdAt}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex flex-wrap justify-end gap-2 min-w-[280px]">
                      <button
                        onClick={() => onEdit?.(lesson)}
                        className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 text-xs font-medium"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => onTogglePublish?.(lesson)}
                        className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium"
                      >
                        {lesson.isPublished ? "Unpublish" : "Publish"}
                      </button>

                      <button
                        onClick={() => onToggleActive?.(lesson)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium ${
                          lesson.isActive
                            ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {lesson.isActive ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        onClick={() => onDelete?.(lesson)}
                        className="px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </div>
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

export default LessonsTable;