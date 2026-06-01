import { howItWorksSteps } from '../../data/landingContent'
import LandingIcon from './LandingIcon'

function HowItWorksSection() {
  return (
    <section className="mt-[25px] flex flex-col gap-8 rounded-[4px] bg-[#eff9f1] px-4 py-5 sm:px-5 sm:py-6 lg:h-[170px] lg:flex-row lg:gap-0 lg:px-[20px] lg:py-0">
      <div className="w-full lg:w-[398px] lg:pt-[21px]">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-500">
          How it works
        </p>
        <h2 className="mt-[16px] max-w-[260px] text-[28px] font-extrabold leading-[1.3] tracking-[-0.045em] text-[#0a0f1a]">
          Simple steps
          <br />
          to your next
          <br />
          home
        </h2>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 lg:flex lg:items-start lg:justify-between lg:pt-[20px]">
        {howItWorksSteps.map((step, index) => (
          <div className="w-full lg:w-[152px]" key={step.title}>
            <div className="mb-[15px] flex items-center">
              <div className="grid h-[48px] w-[48px] place-items-center rounded-full bg-white ring-1 ring-[#dff5e6]">
                <LandingIcon className="text-brand-500" name={step.icon} size={19} />
              </div>
              {index < howItWorksSteps.length - 1 ? (
                <div className="ml-[12px] hidden h-px w-[84px] bg-[#c8dce1] lg:block" />
              ) : null}
            </div>

            <p className="text-[18px] font-extrabold tracking-[-0.04em] text-[#0a0f1a]">
              {step.number} {step.title}
            </p>
            <p className="mt-[8px] max-w-[142px] text-[12px] leading-[1.75] text-[#475569] sm:max-w-none lg:max-w-[142px]">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default HowItWorksSection
