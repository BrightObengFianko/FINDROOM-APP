import LandlordSectionCard from '../components/LandlordSectionCard'

function LandlordPlaceholderPage({ title }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-bold tracking-[-0.03em] text-[#111827] sm:text-[30px]">
          {title}
        </h1>
        <p className="mt-1 text-[14px] text-[#64748b]">
          This standalone preview keeps the sidebar destination in place for later integration.
        </p>
      </div>

      <LandlordSectionCard className="min-h-[420px]">
        <div className="flex h-full min-h-[360px] items-center justify-center rounded-[18px] border border-dashed border-[#cfe6d3] bg-[#f8fcf8]">
          <div className="text-center">
            <p className="text-[18px] font-semibold text-[#111827]">{title}</p>
            <p className="mt-2 text-[14px] text-[#64748b]">
              Reserved as a navigation destination without touching the existing app routes.
            </p>
          </div>
        </div>
      </LandlordSectionCard>
    </div>
  )
}

export default LandlordPlaceholderPage
