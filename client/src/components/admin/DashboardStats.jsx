function DashboardStats({ title, value, subtitle = "" }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1 bg-slate-900" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </h3>

          {subtitle ? (
            <p className="mt-2 text-sm leading-6 text-gray-500">{subtitle}</p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-gray-400">
              Platform metric
            </p>
          )}
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
          <span className="text-lg font-bold">#</span>
        </div>
      </div>
    </div>
  );
}

export default DashboardStats;