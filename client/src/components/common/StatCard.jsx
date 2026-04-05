function StatCard({ title, value, subtitle = "" }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
      <p className="text-sm font-medium text-gray-500">{title}</p>

      <h3 className="text-3xl font-bold text-gray-900 mt-2">
        {value}
      </h3>

      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default StatCard;