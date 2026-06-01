import useLandlordEntry from '../../hooks/useLandlordEntry'

function LandlordCtaSection() {
  const handleLandlordEntry = useLandlordEntry()

  return (
    <section className="mt-[24px] flex flex-col items-start gap-5 rounded-[4px] bg-[#eff9f1] px-4 py-5 sm:px-5 sm:py-6 lg:h-[136px] lg:flex-row lg:items-center lg:justify-between lg:px-[20px] lg:py-0">
      <div>
        <h2 className="text-[22px] font-extrabold tracking-[-0.03em] text-[#0a0f1a]">
          Are you a landlord?
        </h2>
        <p className="mt-[13px] max-w-[470px] text-[15px] font-semibold leading-[1.85] text-[#94a3b8]">
          List your property and connect with thousands of potential
          tenants.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-[12px] lg:w-auto lg:pr-[2px]">
        <a
          className="inline-flex h-[39px] items-center justify-center rounded-[4px] border border-[#d9e2ec] bg-white px-[20px] text-[14px] font-medium text-[#1f2937]"
          href="#about"
        >
          Learn more
        </a>
        <button
          className="inline-flex h-[39px] items-center justify-center rounded-[4px] bg-brand-500 px-[22px] text-[14px] font-medium text-white"
          onClick={handleLandlordEntry}
          type="button"
        >
          List your property
        </button>
      </div>
    </section>
  )
}

export default LandlordCtaSection
