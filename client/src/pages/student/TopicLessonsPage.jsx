import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LessonCard from "../../components/student/LessonCard";
import PageHeader from "../../components/common/PageHeader";
import axios from "../../api/axios";

function TopicLessonsPage() {
  const navigate = useNavigate();
  const { topicId } = useParams();

  const [topics, setTopics] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        setError("");

        const [topicsRes, lessonsRes] = await Promise.all([
          axios.get("/topics/my-topics"),
          axios.get("/lessons/my-lessons"),
        ]);

        console.log("TOPICS DATA:", topicsRes.data);
        console.log("LESSONS DATA:", lessonsRes.data);

        setTopics(topicsRes.data || []);
        setLessons(lessonsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch topic lessons data:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load lessons. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, []);

  const topic = useMemo(() => {
    return topics.find((item) => item._id === topicId);
  }, [topics, topicId]);

  const subject = topic?.subject;

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const lessonTopicId =
        typeof lesson.topic === "string" ? lesson.topic : lesson.topic?._id;

      return lessonTopicId === topicId;
    });
  }, [lessons, topicId]);

  console.log("CURRENT TOPIC ID:", topicId);
  console.log("FILTERED LESSONS:", filteredLessons);

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title={topic?.name || "Topic Lessons"}
        subtitle={
          subject?.name
            ? `Browse lessons for ${topic?.name || "this topic"} in ${subject.name}.`
            : "Browse the lessons available in this topic."
        }
        breadcrumbs={[
          { label: "Dashboard", to: "/student/dashboard" },
          { label: "Subjects", to: "/student/subjects" },
          {
            label: subject?.name || "Subject",
            to: subject?._id ? `/student/subjects/${subject._id}/topics` : "/student/subjects",
          },
          { label: topic?.name || "Lessons" },
        ]}
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            navigate(
              subject?._id
                ? `/student/subjects/${subject._id}/topics`
                : "/student/subjects"
            )
          }
          className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
        >
          Back to Topics
        </button>

        {topic?.term && (
          <div className="inline-flex items-center rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            Term {topic.term}
          </div>
        )}

        {subject?.grade?.name && (
          <div className="inline-flex items-center rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
            {subject.grade.name}
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading lessons...
          </h2>
          <p className="text-gray-600">
            Please wait while we fetch the lessons for this topic.
          </p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Could not load lessons
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      ) : !topic ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Topic not found
          </h2>
          <p className="text-gray-600">
            This topic is not available for your account.
          </p>
        </div>
      ) : filteredLessons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No lessons found
          </h2>
          <p className="text-gray-600">
            Lessons for this topic will appear here once they are available.
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {filteredLessons.length} lesson
              {filteredLessons.length > 1 ? "s" : ""} available
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredLessons.map((lesson) => (
              <LessonCard
                key={lesson._id}
                lesson={lesson}
                onClick={() => navigate(`/student/lessons/${lesson._id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TopicLessonsPage;