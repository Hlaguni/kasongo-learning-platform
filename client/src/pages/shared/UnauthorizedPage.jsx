import { Link } from "react-router-dom";

function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-3">Unauthorized</h1>
      <p className="text-gray-600 mb-6">
        You do not have permission to access this page.
      </p>
      <Link
        to="/login"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Go to Login
      </Link>
    </div>
  );
}

export default UnauthorizedPage;