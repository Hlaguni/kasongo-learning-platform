import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";

function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        title="Student Dashboard"
        subtitle="Welcome back. Open your subjects and continue learning."
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <button
          type="button"
          onClick={() => navigate("/student/subjects")}
          className="w-full text-left bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition duration-200"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            My Subjects
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            View your enrolled subjects, open topics, and continue with lessons.
          </p>
        </button>
      </div>
    </div>
  );
}

export default StudentDashboard;