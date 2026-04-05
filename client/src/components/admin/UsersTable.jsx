function UsersTable({ users = [] }) {
  if (!users.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center text-gray-500">
        No users found.
      </div>
    );
  }

  const getRoleBadge = (role) => {
    if (role === "admin") {
      return "bg-purple-100 text-purple-700";
    }

    if (role === "educator") {
      return "bg-green-100 text-green-700";
    }

    return "bg-blue-100 text-blue-700";
  };

  const getStatusBadge = (isActive) => {
    return isActive
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Name
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Email
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                Role
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
            {users.map((user, index) => {
              const createdAt = user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "-";

              return (
                <tr
                  key={user._id || user.id || `${user.email}-${index}`}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {user.name || "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-700">
                    {user.email || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {user.role || "student"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadge(
                        user.isActive ?? true
                      )}`}
                    >
                      {(user.isActive ?? true) ? "Active" : "Inactive"}
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

export default UsersTable;