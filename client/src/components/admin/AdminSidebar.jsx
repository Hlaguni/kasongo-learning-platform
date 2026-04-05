import { NavLink } from "react-router-dom";

function AdminSidebar() {
  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { name: "Users", path: "/admin/users", icon: "👥" },
    { name: "Grades", path: "/admin/grades", icon: "🏷️" },
    { name: "Subjects", path: "/admin/subjects", icon: "📚" },
    { name: "Topics", path: "/admin/topics", icon: "🧭" },
    { name: "Lessons", path: "/admin/lessons", icon: "🎓" },
    { name: "MCQs", path: "/admin/mcqs", icon: "📝" },
    { name: "Results", path: "/admin/results", icon: "📈" },
    { name: "Enrollments", path: "/admin/enrollments", icon: "🔐" },
  ];

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 min-h-screen bg-slate-900 text-white flex-col shadow-xl">
      <div className="px-6 py-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-wide">Kasongo</h1>
        <p className="text-sm text-slate-300 mt-1">
          Admin Intelligence Panel
        </p>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span className="flex-1">{item.name}</span>
            <span
              className={`h-2 w-2 rounded-full transition ${
                item.path === "/admin/dashboard"
                  ? "bg-transparent"
                  : "bg-transparent group-hover:bg-white/30"
              }`}
            />
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-5 border-t border-slate-800">
        <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-700 px-4 py-4 border border-slate-700">
          <p className="text-sm font-semibold text-white">System Control</p>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            You are managing a live education system. Monitor performance,
            scale content, and control access in real time.
          </p>
          <div className="mt-4 text-xs text-slate-400">
            Version 1.0 • Kasongo Platform
          </div>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;