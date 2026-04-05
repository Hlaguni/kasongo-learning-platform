function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center text-gray-600">
      {message}
    </div>
  );
}

export default LoadingSpinner;