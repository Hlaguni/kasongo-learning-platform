import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_BASE_URL}/api/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // ✅ FIX: store only the stats object
        setStats(response.data.stats);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardStats();
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", backgroundColor: "#f4f7fb" }}>
      <aside
        style={{
          width: "240px",
          backgroundColor: "#1e3a5f",
          color: "white",
          padding: "1.5rem",
        }}
      >
        <h2 style={{ marginBottom: "2rem" }}>Admin Panel</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Link to="/admin" style={{ color: "white", textDecoration: "none" }}>
            Dashboard
          </Link>
          <Link to="/admin/users" style={{ color: "white", textDecoration: "none" }}>
            Users
          </Link>
          <Link to="/admin/lessons" style={{ color: "white", textDecoration: "none" }}>
            Lessons
          </Link>
          <Link to="/admin/attendance" style={{ color: "white", textDecoration: "none" }}>
            Attendance
          </Link>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: "2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h1 style={{ marginBottom: "0.5rem" }}>Admin Dashboard</h1>
            <p>
              Welcome, {user?.name || user?.username || user?.email || "Admin"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "0.75rem 1.25rem",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {loading ? (
          <p>Loading dashboard...</p>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
              }}
            >
              {/* ✅ FIXED CARDS */}
              <div
                style={{
                  backgroundColor: "white",
                  padding: "1rem",
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h3>Total Users</h3>
                <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  {stats?.totalUsers ?? 0}
                </p>
              </div>

              <div
                style={{
                  backgroundColor: "white",
                  padding: "1rem",
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h3>Total Students</h3>
                <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  {stats?.totalStudents ?? 0}
                </p>
              </div>

              <div
                style={{
                  backgroundColor: "white",
                  padding: "1rem",
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h3>Total Teachers</h3>
                <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  {stats?.totalTeachers ?? 0}
                </p>
              </div>

              <div
                style={{
                  backgroundColor: "white",
                  padding: "1rem",
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h3>Total Admins</h3>
                <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  {stats?.totalAdmins ?? 0}
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "white",
                padding: "1.5rem",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <h2 style={{ marginBottom: "1rem" }}>Quick Actions</h2>

              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <Link to="/admin/users">
                  <button>Manage Users</button>
                </Link>

                <Link to="/admin/lessons">
                  <button>Manage Lessons</button>
                </Link>

                <Link to="/admin/attendance">
                  <button>Manage Attendance</button>
                </Link>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;