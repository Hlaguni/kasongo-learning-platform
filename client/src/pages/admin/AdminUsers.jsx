import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function AdminUsers() {
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      await axios.post(`${API_BASE_URL}/api/admin/users`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("Student created successfully");

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "student",
      });

      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create student");
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await axios.delete(`${API_BASE_URL}/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("User deleted successfully");
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Manage Users</h1>

      <form
        onSubmit={handleCreateStudent}
        style={{
          maxWidth: "400px",
          marginBottom: "2rem",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "#fff",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>Create Student</h2>

        <div style={{ marginBottom: "1rem" }}>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.5rem" }}
            required
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.5rem" }}
            required
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{ width: "100%", padding: "0.5rem" }}
            required
          />
        </div>

        <button type="submit">Add Student</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <h2>Students</h2>

      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          style={{ borderCollapse: "collapse", width: "100%", backgroundColor: "#fff" }}
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminUsers;