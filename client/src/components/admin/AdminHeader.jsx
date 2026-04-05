import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

function AdminHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const pageTitle = useMemo(() => {
    const pathname = location.pathname;

    if (pathname.includes("/admin/dashboard")) return "Dashboard";
    if (pathname.includes("/admin/users")) return "Users";
    if (pathname.includes("/admin/grades")) return "Grades";
    if (pathname.includes("/admin/subjects")) return "Subjects";
    if (pathname.includes("/admin/enrollments")) return "Enrollments";
    if (pathname.includes("/admin/topics")) return "Topics";
    if (pathname.includes("/admin/lessons")) return "Lessons";
    if (pathname.includes("/admin/mcqs")) return "MCQs";
    if (pathname.includes("/admin/results")) return "Results";

    return "Admin Panel";
  }, [location.pathname]);

  const pageDescription = useMemo(() => {
    const pathname = location.pathname;

    if (pathname.includes("/admin/dashboard")) {
      return "Monitor platform growth, learner performance, and content readiness.";
    }

    if (pathname.includes("/admin/users")) {
      return "Manage platform users and control account access.";
    }

    if (pathname.includes("/admin/grades")) {
      return "Manage academic grades across the learning platform.";
    }

    if (pathname.includes("/admin/subjects")) {
      return "Organize academic subjects and keep the curriculum structured.";
    }

    if (pathname.includes("/admin/enrollments")) {
      return "Manage registrations, payments, and learner access.";
    }

    if (pathname.includes("/admin/topics")) {
      return "Structure topics under each subject and grade.";
    }

    if (pathname.includes("/admin/lessons")) {
      return "Manage lesson content, publishing, and learning flow.";
    }

    if (pathname.includes("/admin/mcqs")) {
      return "Control quizzes, question quality, and assessment coverage.";
    }

    if (pathname.includes("/admin/results")) {
      return "Review learner performance data and assessment outcomes.";
    }

    return "Manage and monitor the Kasongo Learning Platform.";
  }, [location.pathname]);

  const adminName = user?.name || "Admin";
  const adminRole = user?.role || "administrator";

  const initials = adminName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    if (logout) {
      logout();
    }
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            Kasongo Admin
          </div>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
            {pageTitle}
          </h2>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
            {pageDescription}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
              {initials}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">
                {adminName}
              </p>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {adminRole}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;