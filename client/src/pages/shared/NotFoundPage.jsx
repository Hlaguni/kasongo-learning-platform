import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-3">404</h1>
      <p className="text-gray-600 mb-6">Page not found.</p>
      <Link
        to="/login"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Back to Login
      </Link>
    </div>
  );
}

export default NotFoundPage;