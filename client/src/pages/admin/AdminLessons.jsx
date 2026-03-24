import { useEffect, useState } from "react";
import { createLesson, getLessons, getTopics } from "../../services/lessonService";

function AdminLessons() {
  const [lessons, setLessons] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    topicId: "",
    videoUrl: "",
    description: "",
  });

  const loadLessons = async () => {
    try {
      setLoadingLessons(true);
      const data = await getLessons();
      setLessons(Array.isArray(data) ? data : data.lessons || []);
    } catch (err) {
      console.error("Failed to load lessons:", err);
      setError("Failed to load lessons");
    } finally {
      setLoadingLessons(false);
    }
  };

  const loadTopics = async () => {
    try {
      setLoadingTopics(true);
      const data = await getTopics();
      setTopics(Array.isArray(data) ? data : data.topics || []);
    } catch (err) {
      console.error("Failed to load topics:", err);
      setError("Failed to load topics");
    } finally {
      setLoadingTopics(false);
    }
  };

  useEffect(() => {
    loadLessons();
    loadTopics();
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
      await createLesson(formData);

      setMessage("Lesson created successfully.");
      setFormData({
        title: "",
        topicId: "",
        videoUrl: "",
        description: "",
      });

      await loadLessons();
    } catch (err) {
      console.error("Failed to create lesson:", err);
      setError(err?.response?.data?.message || "Failed to create lesson");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Manage Lessons</h1>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ maxWidth: "600px", marginTop: "20px" }}>
        <div style={{ marginBottom: "12px" }}>
          <label>Title</label>
          <br />
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Topic</label>
          <br />
          <select
            name="topicId"
            value={formData.topicId}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="">Select topic</option>
            {topics.map((topic) => (
              <option key={topic._id} value={topic._id}>
                {topic.name || topic.title || topic.topicName}
              </option>
            ))}
          </select>
          {loadingTopics && <p>Loading topics...</p>}
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Video URL</label>
          <br />
          <input
            type="text"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label>Description</label>
          <br />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Lesson"}
        </button>
      </form>

      <div style={{ marginTop: "30px" }}>
        <h2>Lesson List</h2>

        {loadingLessons ? (
          <p>Loading lessons...</p>
        ) : lessons.length === 0 ? (
          <p>No lessons found.</p>
        ) : (
          <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "15px" }}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Topic</th>
                <th>Video URL</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => (
                <tr key={lesson._id}>
                  <td>{lesson.title}</td>
                  <td>
                    {lesson.topicId?.name ||
                      lesson.topic?.name ||
                      lesson.topicId ||
                      "N/A"}
                  </td>
                  <td>
                    {lesson.videoUrl ? (
                      <a href={lesson.videoUrl} target="_blank" rel="noreferrer">
                        Open Video
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>{lesson.description || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AdminLessons;