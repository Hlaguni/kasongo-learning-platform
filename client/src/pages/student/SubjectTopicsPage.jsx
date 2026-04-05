import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopicCard from "../../components/student/TopicCard";
import PageHeader from "../../components/common/PageHeader";
import axios from "../../api/axios";

function SubjectTopicsPage() {
  const navigate = useNavigate();
  const { subjectId } = useParams();

  const [selectedTerm, setSelectedTerm] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setSelectedTerm(null);
  }, [subjectId]);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        setError("");

        const [subjectsRes, topicsRes] = await Promise.all([
          axios.get("/subjects/my-subjects"),
          axios.get("/topics/my-topics"),
        ]);

        console.log("SUBJECTS DATA:", subjectsRes.data);
        console.log("TOPICS DATA:", topicsRes.data);

        setSubjects(subjectsRes.data || []);
        setTopics(topicsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch subject topics data:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load subject topics. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, []);

  const subject = subjects.find((item) => item._id === subjectId);

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const topicSubjectId =
        typeof topic.subject === "string" ? topic.subject : topic.subject?._id;

      return topicSubjectId === subjectId;
    });
  }, [topics, subjectId]);

  console.log("CURRENT SUBJECT ID:", subjectId);
  console.log("FILTERED TOPICS:", filteredTopics);

  const terms = [1, 2, 3, 4];

  const termCards = useMemo(() => {
    return terms.map((term) => {
      const termTopics = filteredTopics.filter((topic) => topic.term === term);

      const topicCount = termTopics.length;

      const totalLessons = termTopics.reduce(
        (sum, topic) => sum + (topic.lessonsCount ?? 0),
        0
      );

      const totalQuizzes = termTopics.reduce(
        (sum, topic) => sum + (topic.quizzesCount ?? 0),
        0
      );

      return {
        term,
        topicCount,
        totalLessons,
        totalQuizzes,
      };
    });
  }, [filteredTopics]);

  const selectedTermTopics = useMemo(() => {
    return filteredTopics.filter((topic) => topic.term === selectedTerm);
  }, [filteredTopics, selectedTerm]);

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title={
          selectedTerm
            ? `${subject?.name || "Subject"} - Term ${selectedTerm}`
            : `${subject?.name || "Subject"}`
        }
        subtitle={
          selectedTerm
            ? `Browse topics available in Term ${selectedTerm}.`
            : `Select a term to view topics for ${subject?.name || "this subject"}.`
        }
        breadcrumbs={[
          { label: "Dashboard", to: "/student/dashboard" },
          { label: "Subjects", to: "/student/subjects" },
          { label: subject?.name || "topics" },
          ...(selectedTerm ? [{ label: `Term ${selectedTerm}` }] : []),
        ]}
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => navigate("/student/subjects")}
          className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
        >
          Back to Subjects
        </button>

        {selectedTerm && (
          <button
            type="button"
            onClick={() => setSelectedTerm(null)}
            className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
          >
            Back to Terms
          </button>
        )}

        {subject?.grade?.name && (
          <div className="inline-flex items-center rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            {subject.grade.name}
          </div>
        )}

        {selectedTerm && (
          <div className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
            Term {selectedTerm}
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading topics...
          </h2>
          <p className="text-gray-600">
            Please wait while we fetch the subject information.
          </p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Could not load subject information
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
      ) : !subject ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Subject not found
          </h2>
          <p className="text-gray-600">
            This subject is not available for your account.
          </p>
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No subject information found
          </h2>
          <p className="text-gray-600">
            Information for this subject will appear here once they are available.
          </p>
        </div>
      ) : !selectedTerm ? (
        <div>
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Choose a term to open its topics
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {termCards.map((termCard) => (
              <button
                key={termCard.term}
                type="button"
                onClick={() => setSelectedTerm(termCard.term)}
                className={`text-left rounded-2xl border p-5 shadow-sm transition duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                  termCard.topicCount > 0
                    ? "bg-white border-gray-200"
                    : "bg-gray-50 border-gray-200 opacity-70"
                }`}
                disabled={termCard.topicCount === 0}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-sm font-medium text-blue-700 mb-2">
                      Academic Term
                    </p>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      Term {termCard.term}
                    </h2>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      termCard.topicCount > 0
                        ? "bg-blue-50 text-blue-700"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {termCard.topicCount > 0 ? "Open" : "Empty"}
                  </span>
                </div>

                <p className="text-sm text-gray-500 leading-relaxed mb-4">
                  {termCard.topicCount > 0
                    ? `View all topics, lessons, and quizzes available in Term ${termCard.term}.`
                    : `No topics have been added to Term ${termCard.term} yet.`}
                </p>

                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                  <div className="rounded-xl bg-gray-50 px-3 py-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Topics</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {termCard.topicCount}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 px-3 py-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Lessons</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {termCard.totalLessons}
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 px-3 py-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Quizzes</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {termCard.totalQuizzes}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : selectedTermTopics.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No topics in Term {selectedTerm}
          </h2>
          <p className="text-gray-600">
            This term does not have any topics yet.
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              {selectedTermTopics.length} topic
              {selectedTermTopics.length > 1 ? "s" : ""} in Term {selectedTerm}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {selectedTermTopics.map((topic) => (
              <TopicCard
                key={topic._id}
                topic={topic}
                onClick={() => navigate(`/student/topics/${topic._id}/lessons`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SubjectTopicsPage;