import { trustIndicators } from '../../data/landingContent'
import LandingIcon from './LandingIcon'

function TrustIndicators() {
  return (
    <section className="mt-[18px] grid grid-cols-1 gap-3 px-1 text-[12px] font-medium text-[#334155] sm:grid-cols-2 sm:gap-x-6 sm:px-0 lg:grid-cols-4 lg:items-center lg:px-[25px]">
      {trustIndicators.map((item) => (
        <div className="flex items-center gap-[9px]" key={item.label}>
          <LandingIcon className={item.colorClass} name={item.icon} size={15} />
          <span>{item.label}</span>
        </div>
      ))}
    </section>
  )
}

export default TrustIndicators
