function SubjectsTable({ subjects = [] }) {
  if (!subjects.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center text-gray-500">
        No subjects found.
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
                Subject
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Grade
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Created
              </th>
            </tr>
          </thead>

          <tbody>
            {subjects.map((subject, index) => {
              const gradeName =
                subject.grade?.name ||
                subject.grade?.title ||
                subject.gradeName ||
                subject.grade ||
                "-";

              const createdAt = subject.createdAt
                ? new Date(subject.createdAt).toLocaleDateString()
                : "-";

              return (
                <tr
                  key={subject._id || subject.id || `${subject.name}-${index}`}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {subject.name || "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-700">{gradeName}</td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        subject.isActive ?? true
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {(subject.isActive ?? true) ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-gray-700">{createdAt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SubjectsTable;