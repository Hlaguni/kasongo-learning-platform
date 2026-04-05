import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MCQQuestionCard from "../../components/student/MCQQuestionCard";
import PageHeader from "../../components/common/PageHeader";
import axios from "../../api/axios";

function LessonMCQPage() {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [lesson, setLesson] = useState(null);
  const [topics, setTopics] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMCQData = async () => {
      try {
        setLoading(true);
        setError("");
        setCurrentIndex(0);
        setAnswers({});

        const [mcqRes, lessonRes, topicsRes] = await Promise.all([
          axios.get(`/mcqs/student/lesson/${lessonId}`),
          axios.get(`/lessons/${lessonId}`),
          axios.get("/topics/my-topics"),
        ]);

        const mcqPayload = mcqRes.data;

        const extractedQuestions = Array.isArray(mcqPayload)
          ? mcqPayload
          : Array.isArray(mcqPayload?.questions)
          ? mcqPayload.questions
          : Array.isArray(mcqPayload?.data)
          ? mcqPayload.data
          : Array.isArray(mcqPayload?.mcqs)
          ? mcqPayload.mcqs
          : Array.isArray(mcqPayload?.items)
          ? mcqPayload.items
          : [];

        setQuestions(extractedQuestions);
        setLesson(lessonRes.data || null);
        setTopics(topicsRes.data || []);
      } catch (err) {
        console.error("Failed to load MCQ:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load quiz. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMCQData();
  }, [lessonId]);

  const topic = useMemo(() => {
    if (!lesson) return null;

    if (lesson.topic && typeof lesson.topic === "object" && lesson.topic._id) {
      return lesson.topic;
    }

    const lessonTopicId =
      typeof lesson.topic === "string" ? lesson.topic : lesson.topic?._id;

    return topics.find((t) => t._id === lessonTopicId) || null;
  }, [lesson, topics]);

  const subject = topic?.subject;

  const normalizedQuestions = useMemo(() => {
    return questions.map((question, index) => ({
      ...question,
      _id: question._id || question.id || `q-${index}`,
      questionText:
        question.questionText || question.question || question.text || "",
      options: Array.isArray(question.options) ? question.options : [],
    }));
  }, [questions]);

  const currentQuestion = normalizedQuestions[currentIndex];
  const isLastQuestion = currentIndex === normalizedQuestions.length - 1;
  const isFirstQuestion = currentIndex === 0;
  const answeredCount = Object.keys(answers).length;

  const handleSelect = (questionId, optionValue) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionValue,
    }));
  };

  const handleNext = () => {
    if (currentIndex < normalizedQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (normalizedQuestions.length === 0) return;

    const unanswered = normalizedQuestions.some(
      (q) => answers[q._id] === undefined
    );

    if (unanswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    try {
      setSubmitting(true);

      const answersArray = normalizedQuestions.map((q) => answers[q._id]);

      const { data } = await axios.post(`/mcqs/student/submit/${lessonId}`, {
        answers: answersArray,
      });

      const rawScore = data?.score ?? data?.correctAnswers ?? 0;
      const rawTotal = data?.totalQuestions ?? normalizedQuestions.length;

      const result = {
        lessonId,
        lessonTitle: lesson?.title || "Lesson",
        subject:
          typeof subject === "object" ? subject?.name || "" : subject || "",
        topic: topic?.name || "",
        score: rawScore,
        totalQuestions: rawTotal,
        percentage:
          data?.percentage ??
          (rawTotal > 0 ? Math.round((rawScore / rawTotal) * 100) : 0),
        submittedAnswers: data?.submittedAnswers || [],
        correctAnswers: data?.correctAnswers ?? rawScore,
        createdAt: data?.createdAt || new Date().toISOString(),
      };

      navigate(`/student/lessons/${lessonId}/result`, {
        replace: true,
        state: { result },
      });
    } catch (err) {
      console.error("Submit failed:", err);
      alert(err.response?.data?.message || "Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center text-gray-600">
          Loading quiz...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Could not load quiz
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            type="button"
            onClick={() => navigate(`/student/lessons/${lessonId}`)}
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
          >
            Back to Lesson
          </button>
        </div>
      </div>
    );
  }

  if (!Array.isArray(normalizedQuestions) || normalizedQuestions.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center text-gray-600">
          No MCQ available for this lesson yet.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title={`${lesson?.title || "Lesson"} MCQ`}
        subtitle={`${subject?.name || ""}${
          subject?.name && topic?.name ? " • " : ""
        }${topic?.name || ""}`}
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
          {
            label: lesson?.title || "Lesson",
            to: `/student/lessons/${lessonId}`,
          },
          { label: "MCQ" },
        ]}
      />

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>
            Question {currentIndex + 1} of {normalizedQuestions.length}
          </span>
          <span>
            {Math.round(
              ((currentIndex + 1) / normalizedQuestions.length) * 100
            )}
            %
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{
              width: `${
                ((currentIndex + 1) / normalizedQuestions.length) * 100
              }%`,
            }}
          />
        </div>

        <div className="text-sm text-gray-500 mt-2">
          {answeredCount}/{normalizedQuestions.length} answered
        </div>
      </div>

      <MCQQuestionCard
        question={currentQuestion}
        questionNumber={currentIndex + 1}
        selectedOption={answers[currentQuestion._id]}
        onSelect={handleSelect}
      />

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={isFirstQuestion}
          className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 disabled:opacity-50 hover:bg-gray-200 transition"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={isLastQuestion}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50 hover:bg-blue-700 transition"
        >
          Next
        </button>
      </div>

      {isLastQuestion && (
        <div className="mt-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full sm:w-auto bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-70"
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        </div>
      )}
    </div>
  );
}

export default LessonMCQPage;