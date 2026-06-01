import { CreditCard, LayoutDashboard, MessageCircle, Search, TimerReset } from 'lucide-react'
import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import StatCard from '../components/common/StatCard'
import StatusBadge from '../components/common/StatusBadge'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, formatDate } from '../utils/format'

function DashboardPage() {
  const { bookings, payments, recentActivity, rooms, threads, userMap } = useAppData()
  const { user } = useAuth()

  const totalPayments = payments
    .filter((payment) => payment.status === 'successful')
    .reduce((total, payment) => total + payment.amount, 0)

  return (
    <AppShell
      title={`Good morning, ${user.name.split(' ')[0]}!`}
      subtitle="Find your perfect room and stay organized from one clean dashboard."
    >
      <section className="grid gap-4 lg:grid-cols-4">
        <StatCard
          detail="View bookings"
          icon={LayoutDashboard}
          label="Active Bookings"
          value={bookings.filter((booking) => booking.status === 'approved').length}
        />
        <StatCard
          detail="View requests"
          icon={TimerReset}
          label="Pending Requests"
          value={bookings.filter((booking) => booking.status === 'pending').length}
        />
        <StatCard
          detail="View messages"
          icon={MessageCircle}
          label="Messages"
          value={threads.length}
        />
        <StatCard
          detail="View payments"
          icon={CreditCard}
          label="Total Payments"
          value={formatCurrency(totalPayments)}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="section-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-extrabold text-ink">My bookings</p>
              <p className="app-muted">Recent stays and booking requests.</p>
            </div>
            <Link className="text-sm font-semibold text-brand-600" to="/bookings">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {bookings.slice(0, 2).map((booking) => (
              <div className="flex items-center gap-4 rounded-[18px] border border-slate-100 p-3" key={booking.id}>
                <img
                  alt={booking.roomTitle}
                  className="h-20 w-24 rounded-2xl object-cover"
                  src={rooms.find((room) => room.id === booking.roomId)?.images[0]}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{booking.roomTitle}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatCurrency(booking.amount)} / month
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Move in {formatDate(booking.startDate)}
                  </p>
                </div>
                <StatusBadge status={booking.status} />
              </div>
            ))}
          </div>
        </article>

        <article className="section-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-extrabold text-ink">Messages</p>
              <p className="app-muted">Latest landlord conversations.</p>
            </div>
            <Link className="text-sm font-semibold text-brand-600" to="/messages">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {threads.slice(0, 3).map((thread) => {
              const otherUserId = thread.landlordId === user.id ? thread.userId : thread.landlordId
              return (
                <div className="flex items-center gap-3 rounded-[18px] border border-slate-100 p-3" key={thread.id}>
                  <img
                    alt={userMap[otherUserId]?.name}
                    className="h-10 w-10 rounded-full object-cover"
                    src={userMap[otherUserId]?.avatar}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">{userMap[otherUserId]?.name}</p>
                    <p className="truncate text-sm text-slate-500">
                      {thread.messages[thread.messages.length - 1]?.text}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.65fr]">
        <article className="section-card">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-extrabold text-ink">Recent Activity</p>
              <p className="app-muted">Everything that changed across your account.</p>
            </div>
            <span className="text-sm font-semibold text-brand-600">View all</span>
          </div>

          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div className="rounded-[18px] border border-slate-100 p-4" key={activity.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{activity.title}</p>
                  <p className="text-xs text-slate-400">{formatDate(activity.createdAt)}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">{activity.description}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="section-card">
          <p className="text-lg font-extrabold text-ink">Quick Actions</p>
          <p className="app-muted mt-1">Common tasks in one place.</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Link className="rounded-[18px] border border-slate-100 p-4 text-left" to="/rooms">
              <Search className="text-brand-600" size={18} />
              <p className="mt-3 font-semibold text-ink">Search for room</p>
              <p className="mt-1 text-sm text-slate-500">Find your next stay</p>
            </Link>
            <Link className="rounded-[18px] border border-slate-100 p-4 text-left" to="/payments">
              <CreditCard className="text-brand-600" size={18} />
              <p className="mt-3 font-semibold text-ink">Make payment</p>
              <p className="mt-1 text-sm text-slate-500">Finish pending bookings</p>
            </Link>
            <Link className="rounded-[18px] border border-slate-100 p-4 text-left" to="/favorites">
              <LayoutDashboard className="text-brand-600" size={18} />
              <p className="mt-3 font-semibold text-ink">View saved rooms</p>
              <p className="mt-1 text-sm text-slate-500">Compare favorite listings</p>
            </Link>
          </div>
        </article>
      </section>
    </AppShell>
  )
}

export default DashboardPage
