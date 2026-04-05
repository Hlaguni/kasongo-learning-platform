import { Outlet } from "react-router-dom";
import StudentSidebar from "../components/student/StudentSidebar";

function StudentLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <StudentSidebar />

      <main className="flex-1 min-w-0">
        <div className="w-full max-w-6xl mx-auto px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default StudentLayout;