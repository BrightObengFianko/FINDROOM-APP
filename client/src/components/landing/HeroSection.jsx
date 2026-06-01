function HeroSection() {
  return (
    <section className="grid items-start gap-6 pt-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-[40px] lg:pt-0 xl:grid-cols-[496px_572px]">
      <div className="pt-0 lg:pt-[29px]">
        <div className="inline-flex h-[39px] items-center rounded-[4px] border border-[#d9fbe6] bg-[#effdf4] px-[17px] text-[14px] font-medium text-[#16a34a] shadow-[0_4px_12px_rgba(22,163,74,0.06)]">
          Find your perfect Room
        </div>

        <h1 className="mt-6 max-w-[425px] text-[42px] font-extrabold leading-[1.07] tracking-[-0.055em] text-[#0a0f1a] sm:mt-7 sm:text-[50px] lg:mt-[31px] lg:text-[58px]">
          Find a room that feels like home.
        </h1>

        <p className="mt-[18px] max-w-[455px] text-[15px] leading-[1.8] text-[#334155]">
          Search verified rooms for rent in great locations. Simple, safe
          and hassle-free.
        </p>
      </div>

      <div className="pt-0 lg:pt-[25px]">
        <img
          alt="Bedroom placeholder"
          className="h-auto w-full rounded-[4px] object-cover lg:h-[373px] lg:w-[572px]"
          src="/landing/hero-room.jpg"
        />
      </div>
    </section>
  )
}

export default HeroSection
