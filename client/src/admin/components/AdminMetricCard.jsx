function AdminMetricCard({ label, value, detail, actionLabel }) {
  return (
    <article className="panel min-w-0 p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-3 break-words font-display text-2xl font-extrabold text-ink">{value}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{detail}</p>
        {actionLabel ? <span className="text-sm font-semibold text-brand-600">{actionLabel}</span> : null}
      </div>
    </article>
  )
}

export default AdminMetricCard
