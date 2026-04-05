function EmptyState({ title, message }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

export default EmptyState;