function StudentSummaryCard({ title, value, helperText = "" }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
      <p className="text-sm font-medium text-gray-500">{title}</p>

      <div className="mt-3 flex items-end justify-between gap-3">
        <h3 className="text-3xl font-bold text-gray-900 leading-none">
          {value}
        </h3>

        {helperText ? (
          <span className="text-xs text-gray-400 text-right">
            {helperText}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default StudentSummaryCard;