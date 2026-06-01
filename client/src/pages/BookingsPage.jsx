import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import StatusBadge from '../components/common/StatusBadge'
import { useAppData } from '../context/AppDataContext'
import { formatCurrency, formatDate } from '../utils/format'

const tabs = ['all', 'pending', 'approved', 'completed', 'cancelled']

function BookingsPage() {
  const { bookings, rooms } = useAppData()
  const [activeTab, setActiveTab] = useState('all')

  const filteredBookings = useMemo(
    () =>
      activeTab === 'all'
        ? bookings
        : bookings.filter((booking) => booking.status === activeTab),
    [activeTab, bookings],
  )

  return (
    <AppShell
      title="My Bookings"
      subtitle="Track all pending, approved, completed, and cancelled bookings."
    >
      <section className="section-card">
        <div className="mb-5 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                activeTab === tab
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-50 text-slate-500'
              }`}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab[0].toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredBookings.map((booking) => {
            const room = rooms.find((candidate) => candidate.id === booking.roomId)
            return (
              <div className="flex flex-wrap items-center gap-4 rounded-[18px] border border-slate-100 p-4" key={booking.id}>
                <img
                  alt={booking.roomTitle}
                  className="h-20 w-24 rounded-2xl object-cover"
                  src={room?.images[0]}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{booking.roomTitle}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {room?.area || 'Accra'} | {formatCurrency(booking.amount)} / month
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Requested {formatDate(booking.startDate)}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <StatusBadge status={booking.status} />
                  <Link className="action-button-secondary" to={`/rooms/${booking.roomId}`}>
                    View details
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </AppShell>
  )
}

export default BookingsPage
