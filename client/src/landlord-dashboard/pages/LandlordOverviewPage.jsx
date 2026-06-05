import { CalendarCheck2, Home, MessageSquareText, Plus, WalletCards } from 'lucide-react'
import LandlordLineChart from '../components/LandlordLineChart'
import LandlordSectionCard from '../components/LandlordSectionCard'
import LandlordStatCard from '../components/LandlordStatCard'
import LandlordStatusBadge from '../components/LandlordStatusBadge'
import { landlordStats, recentBookings } from '../data'
import { formatCurrency } from '../../utils/format'

const statIcons = {
  'total-listings': Home,
  'upcoming-bookings': CalendarCheck2,
  'unread-messages': MessageSquareText,
  'total-earnings': WalletCards,
}

function LandlordOverviewPage({ onSelect }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-bold tracking-[-0.03em] text-[#111827] sm:text-[30px]">
          Welcome back, John!
        </h1>
        <p className="mt-1 text-[14px] text-[#64748b]">
          Here&apos;s what&apos;s happening with your properties today.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {landlordStats.map((stat) => (
          <LandlordStatCard
            hint={stat.hint}
            icon={statIcons[stat.id]}
            key={stat.id}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </div>

      <div className="grid gap-4 2xl:grid-cols-[1.02fr_1fr]">
        <LandlordSectionCard
          action={
            <button
              className="text-[12px] font-semibold text-[#23933d]"
              onClick={() => onSelect('bookings')}
              type="button"
            >
              View all bookings
            </button>
          }
          title="Recent Bookings"
        >
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div
                className="flex flex-col gap-4 rounded-[18px] border border-[#edf2f7] px-3 py-3 sm:flex-row sm:items-center"
                key={booking.id}
              >
                <img
                  alt={booking.property}
                  className="h-[60px] w-[84px] rounded-[14px] object-cover"
                  src={booking.image}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-[#111827]">
                    {booking.property}
                  </p>
                  <p className="mt-1 text-[12px] text-[#64748b]">{booking.guest}</p>
                  <p className="mt-1 text-[11px] text-[#94a3b8]">{booking.dates}</p>
                </div>

                <div className="space-y-2 text-left sm:text-right">
                  <LandlordStatusBadge status={booking.status} />
                  <p className="text-[13px] font-semibold text-[#111827]">{booking.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </LandlordSectionCard>

        <LandlordSectionCard
          action={
            <button
              className="text-[12px] font-semibold text-[#23933d]"
              onClick={() => onSelect('earnings')}
              type="button"
            >
              View earnings
            </button>
          }
          title="Earnings Overview"
        >
          <div className="mb-4">
            <p className="text-[12px] text-[#64748b]">This Month</p>
            <p className="mt-1 text-[34px] font-bold leading-none tracking-[-0.03em] text-[#111827]">
              {formatCurrency(12450)}
            </p>
            <p className="mt-2 text-[12px] font-semibold text-[#23933d]">+16% vs last month</p>
          </div>

          <LandlordLineChart />
        </LandlordSectionCard>
      </div>

      <LandlordSectionCard className="overflow-hidden p-0">
        <div className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-[16px] bg-[#eff9ef] text-[#24963f]">
              <Plus size={28} />
            </div>
            <div>
              <p className="text-[20px] font-semibold tracking-[-0.02em] text-[#111827]">
                Add New Listing
              </p>
              <p className="mt-1 text-[13px] text-[#64748b]">
                List a new property and start earning more.
              </p>
            </div>
          </div>

          <button
            className="inline-flex items-center justify-center rounded-[12px] bg-[#23933d] px-5 py-3 text-[13px] font-semibold text-white shadow-[0_14px_30px_rgba(36,150,63,0.25)] transition hover:bg-[#1f7f36]"
            onClick={() => onSelect('add-listing')}
            type="button"
          >
            Add New Listing
          </button>
        </div>
      </LandlordSectionCard>
    </div>
  )
}

export default LandlordOverviewPage
