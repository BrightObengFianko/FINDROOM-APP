function LandlordSectionCard({ title, subtitle, action, children, className = '' }) {
  return (
    <section
      className={`ld-card-shadow rounded-[22px] border border-[#e9eef2] bg-white p-5 ${className}`}
    >
      {title || action ? (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title ? (
              <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#0f172a]">
                {title}
              </h2>
            ) : null}
            {subtitle ? <p className="mt-1 text-[12px] text-[#64748b]">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export default LandlordSectionCard
