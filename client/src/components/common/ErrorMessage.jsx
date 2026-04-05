function ErrorMessage({ message = "Something went wrong." }) {
  return (
    <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-6 text-center">
      <h2 className="text-xl font-semibold text-red-600 mb-2">
        Error
      </h2>
      <p className="text-gray-700">{message}</p>
    </div>
  );
}

export default ErrorMessage;