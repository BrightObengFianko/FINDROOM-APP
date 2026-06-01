import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import StatusBadge from '../../components/common/StatusBadge'
import AppShell from '../../components/layout/AppShell'
import { useLandlordWorkspace } from './useLandlordWorkspace'

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

function LandlordBookingsPage() {
  const { bookingRows } = useLandlordWorkspace()
  const [activeTab, setActiveTab] = useState('all')
  const [query, setQuery] = useState('')

  const filteredBookings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return bookingRows.filter((booking) => {
      const matchesTab = activeTab === 'all' || booking.statusKey === activeTab
      const matchesQuery = !normalizedQuery || booking.searchText.includes(normalizedQuery)
      return matchesTab && matchesQuery
    })
  }, [activeTab, bookingRows, query])

  return (
    <AppShell
      subtitle="Review reservation status, guest details, and booking timing in one landlord workspace."
      title="Bookings"
    >
      <section className="section-card">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 xl:mx-0 xl:flex-wrap xl:px-0 xl:pb-0">
            {tabs.map((tab) => (
              <button
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? 'bg-brand-500 text-white'
                    : 'bg-slate-50 text-slate-500'
                }`}
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          <label className="relative block w-full xl:max-w-xs">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              className="field pl-11"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search bookings..."
              value={query}
            />
          </label>
        </div>

        {filteredBookings.length ? (
          <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white sm:rounded-[22px]">
            <div className="overflow-x-auto">
              <table className="min-w-[860px] w-full table-fixed">
                <colgroup>
                  <col style={{ width: '76px' }} />
                  <col />
                  <col style={{ width: '176px' }} />
                  <col style={{ width: '152px' }} />
                  <col style={{ width: '168px' }} />
                  <col style={{ width: '120px' }} />
                </colgroup>

                <thead className="bg-slate-50/90">
                  <tr>
                    <th className="px-2.5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:px-3">
                      Photo
                    </th>
                    <th className="border-l border-slate-100 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:px-4">
                      Property
                    </th>
                    <th className="border-l border-slate-100 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:px-4">
                      Guest
                    </th>
                    <th className="border-l border-slate-100 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:px-4">
                      Stay
                    </th>
                    <th className="border-l border-slate-100 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:px-4">
                      Charges
                    </th>
                    <th className="border-l border-slate-100 px-3 py-3 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:px-4">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((booking) => (
                    <tr className="align-middle" key={booking.id}>
                      <td className="px-2.5 py-2.5 align-middle sm:px-3 sm:py-3">
                        <img
                          alt={booking.property}
                          className="h-12 w-12 rounded-lg object-cover sm:h-14 sm:w-14 sm:rounded-xl"
                          src={booking.image}
                        />
                      </td>

                      <td className="min-w-0 border-l border-slate-100 px-3 py-2.5 align-middle sm:px-4 sm:py-3">
                        <p className="truncate text-[13px] font-semibold text-ink sm:text-sm xl:text-[15px]">
                          {booking.property}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-600 sm:text-[12px] lg:text-[13px]">
                          {booking.location}
                        </p>
                      </td>

                      <td className="min-w-0 border-l border-slate-100 px-3 py-2.5 align-middle sm:px-4 sm:py-3">
                        <p className="truncate text-[13px] font-semibold text-ink sm:text-sm xl:text-[15px]">
                          {booking.guest}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-600 sm:text-[12px] lg:text-[13px]">
                          {booking.email}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-[12px] lg:text-[13px]">
                          {booking.phone}
                        </p>
                      </td>

                      <td className="min-w-0 border-l border-slate-100 px-3 py-2.5 align-middle sm:px-4 sm:py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Start</p>
                        <p className="mt-0.5 truncate text-[13px] font-semibold text-ink sm:text-sm lg:text-[13px] xl:text-[14px]">
                          {booking.dates[0]}
                        </p>
                        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">End</p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-600 sm:text-[12px] lg:text-[13px]">
                          {booking.dates[1]}
                        </p>
                      </td>

                      <td className="min-w-0 border-l border-slate-100 px-3 py-2.5 align-middle sm:px-4 sm:py-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Monthly price</p>
                        <p className="mt-0.5 truncate text-[13px] font-semibold text-ink sm:text-sm lg:text-[13px] xl:text-[14px]">
                          {booking.monthlyPrice}
                        </p>
                        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Total amount</p>
                        <p className="mt-0.5 truncate text-sm font-extrabold text-ink sm:text-[15px] lg:text-base">
                          {booking.totalAmount}
                        </p>
                      </td>

                      <td className="border-l border-slate-100 px-3 py-2.5 align-middle sm:px-4 sm:py-3">
                        <div className="flex justify-center">
                          <StatusBadge status={booking.statusLabel} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
            <p className="text-lg font-bold text-ink">No bookings in this view</p>
            <p className="mt-2 text-sm text-slate-500">
              Change the active tab or search query to explore more reservations.
            </p>
          </div>
        )}
      </section>
    </AppShell>
  )
}

export default LandlordBookingsPage
