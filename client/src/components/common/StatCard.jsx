function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <article className="panel min-w-0 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
          <p className="mt-2 break-words font-display text-xl font-extrabold text-ink sm:text-2xl">
            {value}
          </p>
          {detail ? <p className="mt-2 text-sm text-slate-500">{detail}</p> : null}
        </div>
        {Icon ? (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 sm:h-11 sm:w-11">
            <Icon size={20} />
          </div>
        ) : null}
      </div>
    </article>
  )
}

export default StatCard
