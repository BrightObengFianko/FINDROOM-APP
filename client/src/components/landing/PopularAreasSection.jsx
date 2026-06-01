import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { popularAreas } from '../../data/landingContent'
import LandingIcon from './LandingIcon'

function PopularAreasSection() {
  return (
    <section className="mt-[24px]">
      <h2 className="text-center text-[28px] font-extrabold tracking-[-0.045em] text-[#0a0f1a] sm:text-[32px] lg:text-[36px]">
        Find rooms in popular Areas.
      </h2>

      <div className="mt-[19px] grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-4">
        {popularAreas.map((area) => (
          <Link
            className="relative h-[190px] overflow-hidden rounded-[6px] border border-[#e5e7eb] sm:h-[170px] lg:h-[152px]"
            key={area.title}
            to="/rooms"
          >
            <img
              alt={`${area.title} placeholder`}
              className="h-full w-full object-cover"
              src={area.image}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 px-[16px] pb-[13px]">
              <h3 className="text-[18px] font-extrabold tracking-[-0.03em] text-white">
                {area.title}
              </h3>
              <div className="mt-[4px] flex items-center gap-[4px] text-[11px] text-white">
                <LandingIcon className="text-white" name="mapPin" size={11} />
                <span>{area.rooms}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-[16px] flex justify-center">
        <Link
          className="flex h-[40px] w-full max-w-[190px] items-center justify-center gap-[10px] rounded-[4px] border border-[#d9e2ec] bg-white px-4 text-[14px] font-semibold text-[#1f2937]"
          to="/rooms"
        >
          View all locations
          <ArrowRight size={14} strokeWidth={2.2} />
        </Link>
      </div>
    </section>
  )
}

export default PopularAreasSection
