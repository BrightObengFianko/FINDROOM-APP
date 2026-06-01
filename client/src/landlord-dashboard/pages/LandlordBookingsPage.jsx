import { MoreHorizontal, Search } from 'lucide-react'
import LandlordSectionCard from '../components/LandlordSectionCard'
import LandlordStatusBadge from '../components/LandlordStatusBadge'
import { bookings, bookingTabs } from '../data'

function LandlordBookingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-[30px] font-bold tracking-[-0.03em] text-[#111827]">Bookings</h1>
          <p className="mt-1 text-[14px] text-[#64748b]">View and manage all bookings.</p>
        </div>

        <div className="relative w-full max-w-[290px]">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]"
            size={16}
          />
          <input className="field h-11 rounded-[12px] pl-11" placeholder="Search bookings..." />
        </div>
      </div>

      <LandlordSectionCard className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {bookingTabs.map((tab, index) => (
            <button
              className={`rounded-[10px] px-4 py-2 text-[12px] font-semibold transition ${
                index === 0
                  ? 'bg-[#23933d] text-white'
                  : 'border border-[#e2e8f0] bg-white text-[#64748b]'
              }`}
              key={tab}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-[20px] border border-[#edf2f7]">
          <div className="hidden grid-cols-[1.55fr_1fr_1fr_0.65fr_0.65fr_56px] items-center gap-4 bg-[#fbfcfd] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8] xl:grid">
            <span>Property</span>
            <span>Guest</span>
            <span>Check-in / Check-out</span>
            <span>Amount</span>
            <span>Status</span>
            <span className="text-right">Action</span>
          </div>

          <div className="divide-y divide-[#edf2f7]">
            {bookings.map((booking) => (
              <div
                className="grid gap-4 px-5 py-4 xl:grid-cols-[1.55fr_1fr_1fr_0.65fr_0.65fr_56px] xl:items-center"
                key={booking.id}
              >
                <div className="flex items-center gap-4">
                  <img
                    alt={booking.property}
                    className="h-[60px] w-[76px] rounded-[14px] object-cover"
                    src={booking.image}
                  />
                  <p className="text-[13px] font-semibold text-[#111827]">{booking.property}</p>
                </div>

                <div>
                  <p className="text-[13px] font-semibold text-[#111827]">{booking.guest}</p>
                  <p className="mt-1 text-[12px] text-[#64748b]">{booking.email}</p>
                  <p className="mt-1 text-[12px] text-[#64748b]">{booking.phone}</p>
                </div>

                <div>
                  <p className="text-[13px] font-medium text-[#111827]">{booking.dates[0]}</p>
                  <p className="mt-1 text-[13px] font-medium text-[#111827]">{booking.dates[1]}</p>
                </div>

                <div className="text-[13px] font-semibold text-[#111827]">{booking.amount}</div>

                <div>
                  <LandlordStatusBadge status={booking.status} />
                </div>

                <div className="xl:text-right">
                  <button
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#e2e8f0] text-[#64748b]"
                    type="button"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </LandlordSectionCard>
    </div>
  )
}

export default LandlordBookingsPage
