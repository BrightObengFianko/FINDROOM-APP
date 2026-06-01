function LandlordStatCard({ icon: Icon, label, value, hint }) {
  return (
    <article className="ld-card-shadow rounded-[22px] border border-[#e9eef2] bg-white p-5">
      <div className="flex items-start gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-[#eff9ef] text-[#24963f]">
          <Icon size={28} strokeWidth={2.2} />
        </div>
        <div className="space-y-1.5">
          <p className="text-[12px] font-semibold text-[#64748b]">{label}</p>
          <p className="text-[30px] font-bold leading-none text-[#0f172a]">{value}</p>
          <p className="text-[12px] text-[#7b8794]">{hint}</p>
        </div>
      </div>
    </article>
  )
}

export default LandlordStatCard
