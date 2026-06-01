const styles = {
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  completed: 'bg-sky-50 text-sky-700 ring-sky-100',
  confirmed: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  info: 'bg-sky-50 text-sky-700 ring-sky-100',
  ongoing: 'bg-brand-50 text-brand-700 ring-brand-100',
  pending: 'bg-amber-50 text-amber-700 ring-amber-100',
  failed: 'bg-rose-50 text-rose-700 ring-rose-100',
  cancelled: 'bg-slate-100 text-slate-600 ring-slate-200',
  inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-100',
  removed: 'bg-rose-50 text-rose-700 ring-rose-100',
  successful: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  upcoming: 'bg-amber-50 text-amber-700 ring-amber-100',
  updated: 'bg-slate-100 text-slate-600 ring-slate-200',
}

function StatusBadge({ status }) {
  const normalizedStatus = String(status || '').trim().toLowerCase()

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold capitalize ring-1 ${
        styles[normalizedStatus] || 'bg-slate-50 text-slate-700 ring-slate-200'
      }`}
    >
      {status}
    </span>
  )
}

export default StatusBadge
