import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PDFButton from "../../components/student/PDFButton";
import LessonViewer from "../../components/student/LessonViewer";
import PageHeader from "../../components/common/PageHeader";
import axios from "../../api/axios";

function LessonDetailPage() {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [lesson, setLesson] = useState(null);
  const [topics, setTopics] = useState([]);
  const [hasMcq, setHasMcq] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true);
        setError("");

        const [lessonRes, topicsRes, mcqRes] = await Promise.allSettled([
          axios.get(`/lessons/${lessonId}`),
          axios.get("/topics/my-topics"),
          axios.get(`/mcqs/student/lesson/${lessonId}`),
        ]);

        if (lessonRes.status === "fulfilled") {
          const payload = lessonRes.value.data;

          const extractedLesson =
            payload?.lesson ||
            payload?.data ||
            payload ||
            null;

          const normalizedLesson = extractedLesson
            ? {
                ...extractedLesson,
                videoUrl:
                  extractedLesson.videoUrl ||
                  extractedLesson.videoURL ||
                  extractedLesson.video ||
                  extractedLesson.videoLink ||
                  "",
                pdfUrl:
                  extractedLesson.pdfUrl ||
                  extractedLesson.pdfURL ||
                  extractedLesson.pdf ||
                  extractedLesson.notesUrl ||
                  "",
              }
            : null;

          setLesson(normalizedLesson);
        } else {
          throw lessonRes.reason;
        }

        if (topicsRes.status === "fulfilled") {
          const topicPayload = topicsRes.value.data;
          const extractedTopics = Array.isArray(topicPayload)
            ? topicPayload
            : Array.isArray(topicPayload?.topics)
            ? topicPayload.topics
            : Array.isArray(topicPayload?.data)
            ? topicPayload.data
            : [];

          setTopics(extractedTopics);
        }

        if (mcqRes.status === "fulfilled") {
          const payload = mcqRes.value.data;

          const mcqExists = Array.isArray(payload)
            ? payload.length > 0
            : Array.isArray(payload?.questions)
            ? payload.questions.length > 0
            : Array.isArray(payload?.data)
            ? payload.data.length > 0
            : !!payload?._id || !!payload?.lesson;

          setHasMcq(mcqExists);
        } else {
          setHasMcq(false);
        }
      } catch (err) {
        console.error("Failed to fetch lesson detail:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load the lesson. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [lessonId]);

  const topic = useMemo(() => {
    if (!lesson) return null;

    if (lesson.topic && typeof lesson.topic === "object" && lesson.topic._id) {
      return lesson.topic;
    }

    const lessonTopicId =
      typeof lesson.topic === "string" ? lesson.topic : lesson.topic?._id;

    return topics.find((item) => item._id === lessonTopicId) || null;
  }, [lesson, topics]);

  const subject = topic?.subject;
  const hasPdf = !!lesson?.pdfUrl;

  const handleOpenPDF = () => {
    if (hasPdf) {
      window.open(lesson.pdfUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleTakeMCQ = () => {
    if (hasMcq) {
      navigate(`/student/lessons/${lessonId}/mcq`);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <PageHeader
          title="Loading lesson..."
          subtitle="Please wait while we fetch the lesson details."
          breadcrumbs={[
            { label: "Dashboard", to: "/student/dashboard" },
            { label: "Subjects", to: "/student/subjects" },
            { label: "Lesson" },
          ]}
        />

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading lesson...
          </h2>
          <p className="text-gray-600">
            Please wait while we fetch the lesson details.
          </p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="p-4 md:p-6">
        <PageHeader
          title="Lesson Not Found"
          subtitle="The lesson you are trying to open could not be found."
          breadcrumbs={[
            { label: "Dashboard", to: "/student/dashboard" },
            { label: "Subjects", to: "/student/subjects" },
            { label: "Lesson" },
          ]}
        />

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Lesson not found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "This lesson may have been removed or is not available yet."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/student/subjects")}
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
          >
            Back to Subjects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title={lesson.title || "Lesson"}
        subtitle={`${subject?.name || ""}${subject?.name && topic?.name ? " • " : ""}${
          topic?.name || ""
        }${lesson.lessonNumber ? ` • Lesson ${lesson.lessonNumber}` : ""}`}
        breadcrumbs={[
          { label: "Dashboard", to: "/student/dashboard" },
          { label: "Subjects", to: "/student/subjects" },
          {
            label: subject?.name || "Subject",
            to: subject?._id
              ? `/student/subjects/${subject._id}/topics`
              : "/student/subjects",
          },
          {
            label: topic?.name || "Topic",
            to: topic?._id
              ? `/student/topics/${topic._id}/lessons`
              : "/student/subjects",
          },
          { label: lesson.title || "Lesson" },
        ]}
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            navigate(
              topic?._id
                ? `/student/topics/${topic._id}/lessons`
                : "/student/subjects"
            )
          }
          className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
        >
          Back to Lessons
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

      <LessonViewer lesson={lesson} />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Lesson Resources
        </h2>
        <p className="text-sm text-gray-600 mb-5">
          Open lesson notes or continue to the quiz if one is available.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <PDFButton pdfUrl={lesson.pdfUrl} onClick={handleOpenPDF} />

          <button
            type="button"
            onClick={hasMcq ? handleTakeMCQ : undefined}
            disabled={!hasMcq}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium transition ${
              hasMcq
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed border border-dashed"
            }`}
          >
            {hasMcq ? "Take Quiz" : "No Quiz Available"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LessonDetailPage;