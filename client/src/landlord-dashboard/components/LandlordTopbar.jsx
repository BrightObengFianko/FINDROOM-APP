import { Bell, ChevronDown, Menu } from 'lucide-react'

function LandlordTopbar() {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <button
        className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-[#e8edf1] bg-white text-[#475569] xl:hidden"
        type="button"
      >
        <Menu size={18} />
      </button>

      <div className="hidden xl:block" />

      <div className="ml-auto flex items-center gap-4">
        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-[14px] border border-[#e8edf1] bg-white text-[#334155] shadow-[0_10px_25px_rgba(15,23,42,0.04)]"
          type="button"
        >
          <Bell size={18} />
        </button>

        <button
          className="flex items-center gap-3 rounded-[16px] border border-[#e8edf1] bg-white px-4 py-2.5 text-left shadow-[0_10px_25px_rgba(15,23,42,0.04)]"
          type="button"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#24963f] text-[13px] font-semibold text-white">
            JD
          </span>
          <span className="hidden min-w-0 md:block">
            <span className="block truncate text-[13px] font-semibold text-[#111827]">
              John Doe
            </span>
          </span>
          <ChevronDown className="text-[#64748b]" size={16} />
        </button>
      </div>
    </div>
  )
}

export default LandlordTopbar
