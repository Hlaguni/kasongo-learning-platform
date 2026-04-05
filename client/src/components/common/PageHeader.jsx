import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

function PageHeader({ title, subtitle = "", breadcrumbs = [] }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const isSubjectsPage = location.pathname === "/student/subjects";
  const isDashboardPage = location.pathname === "/student/dashboard";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="mb-6">
      {breadcrumbs.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              {item.to ? (
                <Link
                  to={item.to}
                  className="hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-gray-700">{item.label}</span>
              )}

              {index < breadcrumbs.length - 1 && (
                <span className="text-gray-400">/</span>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-5 py-5 md:px-6 md:py-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {title}
            </h1>

            {subtitle && (
              <p className="text-gray-600 mt-2 max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {!isDashboardPage && (
              <button
                type="button"
                onClick={() => navigate("/student/dashboard")}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
              >
                Dashboard
              </button>
            )}

            {!isSubjectsPage && (
              <button
                type="button"
                onClick={() => navigate("/student/subjects")}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 text-sm font-medium hover:bg-gray-200 transition"
              >
                Subjects
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageHeader;