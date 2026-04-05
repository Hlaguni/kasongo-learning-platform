import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SubjectCard from "../../components/student/SubjectCard";
import PageHeader from "../../components/common/PageHeader";
import axios from "../../api/axios";

function MySubjectsPage() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await axios.get("/subjects/my-subjects");
        setSubjects(data || []);
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
        setError(
          err.response?.data?.message || "Failed to load subjects. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title="My Subjects"
        subtitle="Access your enrolled subjects, open topics, and continue learning from where you left off."
        breadcrumbs={[
          { label: "Dashboard", to: "/student/dashboard" },
          { label: "Subjects" },
        ]}
      />

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading subjects...
          </h2>
          <p className="text-gray-600">
            Please wait while we fetch your enrolled subjects.
          </p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Could not load subjects
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
      ) : subjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No subjects available yet
          </h2>
          <p className="text-gray-600">
            Your enrolled subjects will appear here once they are available.
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {subjects.length} subject{subjects.length > 1 ? "s" : ""} available
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject._id}
                subject={subject}
                onClick={() =>
                  navigate(`/student/subjects/${subject._id}/topics`)
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MySubjectsPage;