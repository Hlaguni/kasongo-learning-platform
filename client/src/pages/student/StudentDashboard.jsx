import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";
import "./StudentDashboard.css";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openTopics, setOpenTopics] = useState({});

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [studentRes, lessonsRes, attendanceRes] = await Promise.all([
          API.get("/auth/me"),
          API.get("/lesson"),
          API.get("/attendance/my-attendance"),
        ]);

        const lessonsData = Array.isArray(lessonsRes.data) ? lessonsRes.data : [];
        const attendanceData = Array.isArray(attendanceRes.data)
          ? attendanceRes.data
          : [];

        setStudent(studentRes.data);
        setLessons(lessonsData);
        setAttendance(attendanceData);

        const grouped = {};
        lessonsData.forEach((lesson) => {
          const topicName =
            lesson.topicId?.name ||
            lesson.topic?.name ||
            lesson.topicName ||
            "Uncategorized";

          if (!(topicName in grouped)) {
            grouped[topicName] = true;
          }
        });

        setOpenTopics(grouped);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const groupedLessons = useMemo(() => {
    const grouped = {};

    lessons.forEach((lesson) => {
      const topicName =
        lesson.topicId?.name ||
        lesson.topic?.name ||
        lesson.topicName ||
        "Uncategorized";

      if (!grouped[topicName]) {
        grouped[topicName] = [];
      }

      grouped[topicName].push(lesson);
    });

    return grouped;
  }, [lessons]);

  const presentCount = attendance.filter(
    (item) => item.status?.toLowerCase() === "present"
  ).length;

  const absentCount = attendance.filter(
    (item) => item.status?.toLowerCase() === "absent"
  ).length;

  const totalAttendance = attendance.length;
  const topicCount = Object.keys(groupedLessons).length;

  const attendanceRate =
    totalAttendance > 0
      ? Math.round((presentCount / totalAttendance) * 100)
      : 0;

  const toggleTopic = (topicName) => {
    setOpenTopics((prev) => ({
      ...prev,
      [topicName]: !prev[topicName],
    }));
  };

  if (loading) return <div className="student-state">Loading dashboard...</div>;
  if (error) return <div className="student-state error">{error}</div>;

  return (
    <div className="student-dashboard">
      <section className="student-hero">
        <div>
          <p className="student-hero-label">Grade 10 Mathematics</p>
          <h1>Welcome, {student?.name || "Student"}</h1>
          <p className="student-hero-subtext">
            Browse your lessons by topic and track your attendance progress in a
            simple, organized way.
          </p>
        </div>

        <div className="student-hero-actions">
          <div className="student-profile-mini">
            <span>{student?.email || "No email available"}</span>
          </div>

          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </section>

      <section className="student-stats">
        <div className="student-stat-card">
          <p>Topics</p>
          <h2>{topicCount}</h2>
        </div>

        <div className="student-stat-card">
          <p>Total Lessons</p>
          <h2>{lessons.length}</h2>
        </div>

        <div className="student-stat-card">
          <p>Present</p>
          <h2>{presentCount}</h2>
        </div>

        <div className="student-stat-card">
          <p>Attendance Rate</p>
          <h2>{attendanceRate}%</h2>
        </div>
      </section>

      <section className="student-main-grid">
        <div className="student-panel student-panel-large">
          <div className="student-panel-header">
            <div>
              <p className="student-panel-label">Lesson Library</p>
              <h3>Lessons by Topic</h3>
            </div>
          </div>

          {Object.keys(groupedLessons).length === 0 ? (
            <p className="student-empty">No lessons available yet.</p>
          ) : (
            <div className="topic-groups">
              {Object.entries(groupedLessons).map(([topicName, topicLessons]) => (
                <div key={topicName} className="topic-card">
                  <button
                    className="topic-header"
                    onClick={() => toggleTopic(topicName)}
                    type="button"
                  >
                    <div>
                      <h4>{topicName}</h4>
                      <p>{topicLessons.length} lesson(s)</p>
                    </div>

                    <span className="topic-toggle">
                      {openTopics[topicName] ? "−" : "+"}
                    </span>
                  </button>

                  {openTopics[topicName] && (
                    <div className="topic-lessons">
                      {topicLessons.map((lesson) => (
                        <div key={lesson._id} className="lesson-item">
                          <div className="lesson-item-main">
                            <h5>{lesson.title}</h5>
                            <p>
                              {lesson.description || "No description available."}
                            </p>
                          </div>

                          {lesson.videoUrl && (
                            <a
                              href={lesson.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="lesson-action"
                            >
                              Open Lesson
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="student-panel student-panel-side">
          <div className="student-panel-header">
            <div>
              <p className="student-panel-label">Attendance</p>
              <h3>Attendance Tracker</h3>
            </div>
          </div>

          <div className="attendance-tracker">
            <div className="attendance-progress-wrap">
              <div className="attendance-progress-head">
                <span>Progress</span>
                <strong>{attendanceRate}%</strong>
              </div>

              <div className="attendance-progress-bar">
                <div
                  className="attendance-progress-fill"
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
            </div>

            <div className="attendance-summary-grid">
              <div className="attendance-summary-card">
                <p>Total Records</p>
                <h4>{totalAttendance}</h4>
              </div>

              <div className="attendance-summary-card">
                <p>Present</p>
                <h4>{presentCount}</h4>
              </div>

              <div className="attendance-summary-card">
                <p>Absent</p>
                <h4>{absentCount}</h4>
              </div>

              <div className="attendance-summary-card">
                <p>Status</p>
                <h4>{attendanceRate >= 75 ? "Good" : "Improve"}</h4>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;