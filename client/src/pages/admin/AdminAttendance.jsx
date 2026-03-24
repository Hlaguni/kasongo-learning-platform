import { useEffect, useState } from "react";
import { getAttendance, markAttendance } from "../../services/attendanceService";
import { getAllUsers } from "../../services/adminService";

function AdminAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    student: "",
    date: "",
    status: "present",
    note: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);

      const [attendanceData, usersData] = await Promise.all([
        getAttendance(),
        getAllUsers(),
      ]);

      setAttendance(Array.isArray(attendanceData) ? attendanceData : attendanceData.records || []);

      const allUsers = Array.isArray(usersData) ? usersData : usersData.users || [];
      const onlyStudents = allUsers.filter((user) => user.role === "student");
      setStudents(onlyStudents);
    } catch (err) {
      console.error("Failed to load attendance data:", err);
      setError("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    try {
      await markAttendance(formData);

      setMessage("Attendance marked successfully.");
      setFormData({
        student: "",
        date: "",
        status: "present",
        note: "",
      });

      await loadData();
    } catch (err) {
      console.error("Failed to mark attendance:", err);
      setError(err?.response?.data?.message || "Failed to mark attendance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Manage Attendance</h1>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ maxWidth: "600px", marginTop: "20px" }}>
        <div style={{ marginBottom: "12px" }}>
          <label>Student</label>
          <br />
          <select
            name="student"
            value={formData.student}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="">Select student</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.name} ({student.email})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Date</label>
          <br />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Status</label>
          <br />
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
          </select>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Note</label>
          <br />
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            rows="3"
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Mark Attendance"}
        </button>
      </form>

      <div style={{ marginTop: "30px" }}>
        <h2>Attendance Records</h2>

        {loading ? (
          <p>Loading attendance...</p>
        ) : attendance.length === 0 ? (
          <p>No attendance records found.</p>
        ) : (
          <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "15px" }}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Status</th>
                <th>Date</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record._id}>
                  <td>{record.student?.name || record.studentName || record.student || "Unknown"}</td>
                  <td>{record.status}</td>
                  <td>{record.date ? new Date(record.date).toLocaleDateString() : "N/A"}</td>
                  <td>{record.note || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminAttendance;