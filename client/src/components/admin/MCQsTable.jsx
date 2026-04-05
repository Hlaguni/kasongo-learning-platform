function MCQsTable({
  mcqs = [],
  onEdit,
  onDelete,
  onTogglePublish,
  onToggleActive,
}) {
  const getLessonTitle = (mcq) => {
    return mcq.lesson?.title || mcq.lessonTitle || "—";
  };

  const getSubjectName = (mcq) => {
    return (
      mcq.lesson?.subject?.name ||
      mcq.subject?.name ||
      mcq.subjectName ||
      "—"
    );
  };

  const getTopicName = (mcq) => {
    return (
      mcq.lesson?.topic?.name ||
      mcq.topic?.name ||
      mcq.topicName ||
      "—"
    );
  };

  const getCreatedDate = (mcq) => {
    if (!mcq.createdAt) return "—";
    return new Date(mcq.createdAt).toLocaleDateString();
  };

  if (!mcqs.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center text-gray-500">
        No MCQs found.
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
                Questions
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
            {mcqs.map((mcq, index) => (
              <tr
                key={mcq._id || `${getLessonTitle(mcq)}-${index}`}
                className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-4">
                  <div className="min-w-[240px]">
                    <p className="font-semibold text-gray-900">
                      {getLessonTitle(mcq)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {mcq.instructions || "No instructions"}
                    </p>
                  </div>
                </td>

                <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                  {getTopicName(mcq)}
                </td>

                <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                  {getSubjectName(mcq)}
                </td>

                <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                  {mcq.questions?.length || 0}
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      mcq.isPublished
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {mcq.isPublished ? "Published" : "Draft"}
                  </span>
                </td>

                <td className="px-4 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      mcq.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {mcq.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                  {getCreatedDate(mcq)}
                </td>

                <td className="px-4 py-4">
                  <div className="flex flex-wrap justify-end gap-2 min-w-[280px]">
                    <button
                      onClick={() => onEdit?.(mcq)}
                      className="px-3 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 text-xs font-medium"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onTogglePublish?.(mcq)}
                      className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium"
                    >
                      {mcq.isPublished ? "Unpublish" : "Publish"}
                    </button>

                    <button
                      onClick={() => onToggleActive?.(mcq)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium ${
                        mcq.isActive
                          ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                          : "bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {mcq.isActive ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      onClick={() => onDelete?.(mcq)}
                      className="px-3 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MCQsTable;