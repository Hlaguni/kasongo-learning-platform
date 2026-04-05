import { NavLink } from "react-router-dom";

function StudentSidebar() {
  const navItems = [
    { name: "Dashboard", path: "/student/dashboard" },
    { name: "My Subjects", path: "/student/subjects" },
    { name: "My Results", path: "/student/results" },
  ];

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 min-h-screen bg-blue-900 text-white flex-col shadow-lg">
      <div className="px-6 py-6 border-b border-blue-800">
        <h1 className="text-2xl font-bold tracking-wide">Kasongo</h1>
        <p className="text-sm text-blue-100 mt-1">Learning Platform</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-white text-blue-900 shadow"
                  : "text-blue-100 hover:bg-blue-800 hover:text-white"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-blue-800">
        <div className="rounded-xl bg-blue-800 px-4 py-3">
          <p className="text-sm font-semibold">Student Panel</p>
          <p className="text-xs text-blue-100 mt-1">
            Access your subjects, lessons, PDFs, quizzes, and results.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default StudentSidebar;