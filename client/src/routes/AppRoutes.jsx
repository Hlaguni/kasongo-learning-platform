import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Auth
import LoginPage from "../pages/auth/LoginPage";
import UnauthorizedPage from "../pages/shared/UnauthorizedPage";

// Student Pages
import StudentDashboard from "../pages/student/StudentDashboard";
import MySubjectsPage from "../pages/student/MySubjectsPage";
import SubjectTopicsPage from "../pages/student/SubjectTopicsPage";
import TopicLessonsPage from "../pages/student/TopicLessonsPage";
import LessonDetailPage from "../pages/student/LessonDetailPage";
import LessonMCQPage from "../pages/student/LessonMCQPage";
import LessonResultPage from "../pages/student/LessonResultPage";
import MyResultsPage from "../pages/student/MyResultsPage";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import UsersPage from "../pages/admin/UsersPage";
import GradesPage from "../pages/admin/GradesPage";
import SubjectsPage from "../pages/admin/SubjectsPage";
import EnrollmentsPage from "../pages/admin/EnrollmentsPage";
import TopicsPage from "../pages/admin/TopicsPage";
import LessonsPage from "../pages/admin/LessonsPage";
import MCQsPage from "../pages/admin/MCQsPage";
import ResultsPage from "../pages/admin/ResultsPage";
import StudentResultsPage from "../pages/admin/StudentResultsPage";

// Layouts
import StudentLayout from "../layouts/StudentLayout";
import AdminLayout from "../layouts/AdminLayout";

// Protection
import ProtectedRoute from "../components/common/ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* ================= STUDENT ================= */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/subjects" element={<MySubjectsPage />} />
          <Route
            path="/student/subjects/:subjectId/topics"
            element={<SubjectTopicsPage />}
          />
          <Route
            path="/student/topics/:topicId/lessons"
            element={<TopicLessonsPage />}
          />
          <Route
            path="/student/lessons/:lessonId"
            element={<LessonDetailPage />}
          />
          <Route
            path="/student/lessons/:lessonId/mcq"
            element={<LessonMCQPage />}
          />
          <Route
            path="/student/lessons/:lessonId/result"
            element={<LessonResultPage />}
          />
          <Route path="/student/results" element={<MyResultsPage />} />
        </Route>

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="grades" element={<GradesPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="enrollments" element={<EnrollmentsPage />} />
          <Route path="topics" element={<TopicsPage />} />
          <Route path="lessons" element={<LessonsPage />} />
          <Route path="mcqs" element={<MCQsPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route
            path="results/student/:studentId"
            element={<StudentResultsPage />}
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;