import { ChevronDown, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import LandingIcon from './LandingIcon'

function SearchBar() {
  const navigate = useNavigate()

  return (
    <section className="mt-[15px] pl-0 lg:pl-[32px]">
      <div className="flex w-full max-w-[807px] flex-col gap-3 rounded-[12px] border border-[#e1e8f0] bg-white p-3 shadow-[0_18px_36px_-26px_rgba(15,23,42,0.35)] sm:flex-row sm:flex-wrap sm:gap-[8px] sm:p-4 lg:h-[89px] lg:flex-nowrap lg:items-center lg:px-[12px] lg:py-0">
        <label className="flex h-[62px] w-full min-w-0 flex-col justify-center rounded-[8px] border border-[#eef2f6] bg-[#fbfcfe] px-[15px] sm:flex-1 lg:w-[236px] lg:flex-none">
          <span className="flex items-center gap-[8px] text-[12px] font-bold text-[#0f1728]">
            <LandingIcon className="text-[#8a94a6]" name="mapPin" size={14} />
            Location
          </span>
          <input
            className="mt-[8px] border-none bg-transparent p-0 text-[11px] text-[#94a3b8] outline-none placeholder:text-[#94a3b8]"
            placeholder="e.g Accra, East legon"
            readOnly
            value=""
          />
        </label>

        <label className="relative flex h-[62px] w-full min-w-0 flex-col justify-center rounded-[8px] border border-[#eef2f6] bg-[#fbfcfe] px-[15px] sm:flex-1 lg:w-[206px] lg:flex-none">
          <span className="flex items-center gap-[8px] text-[12px] font-bold text-[#0f1728]">
            <LandingIcon className="text-[#8a94a6]" name="bed" size={14} />
            Room Type
          </span>
          <input
            className="mt-[8px] border-none bg-transparent p-0 pr-[20px] text-[11px] text-[#94a3b8] outline-none placeholder:text-[#94a3b8]"
            placeholder="e.g single-room"
            readOnly
            value=""
          />
          <ChevronDown className="absolute right-[14px] top-[34px] text-[#6b7280]" size={14} />
        </label>

        <label className="flex h-[62px] w-full min-w-0 flex-col justify-center rounded-[8px] border border-[#eef2f6] bg-[#fbfcfe] px-[15px] sm:flex-1 lg:w-[206px] lg:flex-none">
          <span className="flex items-center gap-[8px] text-[12px] font-bold text-[#0f1728]">
            <LandingIcon className="text-[#8a94a6]" name="calendar" size={14} />
            Move in
          </span>
          <input
            className="mt-[8px] border-none bg-transparent p-0 text-[11px] text-[#94a3b8] outline-none placeholder:text-[#94a3b8]"
            placeholder="Select date"
            readOnly
            value=""
          />
        </label>

        <button
          className="flex h-[62px] w-full items-center justify-center gap-[9px] rounded-[8px] bg-brand-500 text-[14px] font-semibold text-white sm:flex-1 lg:w-[110px] lg:flex-none"
          onClick={() => navigate('/rooms')}
          type="button"
        >
          <Search size={16} strokeWidth={2.25} />
          search
        </button>
      </div>
    </section>
  )
}

export default SearchBar
