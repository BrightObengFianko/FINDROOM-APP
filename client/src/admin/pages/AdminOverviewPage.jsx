import { Bell, Download } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AppShell from '../../components/layout/AppShell'
import StatusBadge from '../../components/common/StatusBadge'
import { formatDate } from '../../utils/format'
import AdminMetricCard from '../components/AdminMetricCard'
import { useAdminWorkspace } from '../hooks/useAdminWorkspace'

function AdminOverviewPage() {
  const { user } = useAuth()
  const { overviewCards, recentListings, recentActivity, notifications } = useAdminWorkspace()
  const firstName = user?.name?.split(' ')[0] || 'Admin'

  return (
    <AppShell
      actions={
        <div className="flex flex-wrap gap-3">
          <button className="action-button-secondary justify-center" type="button">
            <Bell size={16} />
          </button>
          <Link className="action-button-primary" to="/admin/reports">
            <Download size={16} />
            Export
          </Link>
        </div>
      }
      subtitle="Here's what's happening on your platform today."
      title={`Welcome back, ${firstName}!`}
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => (
          <AdminMetricCard
            actionLabel={card.actionLabel}
            detail={card.detail}
            key={card.label}
            label={card.label}
            value={card.value}
          />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="section-card min-w-0">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-extrabold text-ink">Recent listings</p>
              <p className="app-muted">Newest properties entering moderation and review.</p>
            </div>
            <Link className="text-sm font-semibold text-brand-600" to="/admin/listings">
              View all
            </Link>
          </div>

          <div className="space-y-3">
            {recentListings.map((listing) => (
              <div
                className="flex flex-col gap-4 rounded-[18px] border border-slate-100 p-3 sm:flex-row sm:items-center sm:rounded-[20px] sm:p-4"
                key={listing.id}
              >
                <img
                  alt={listing.title}
                  className="h-20 w-full rounded-[18px] object-cover sm:h-20 sm:w-24 sm:rounded-[20px]"
                  src={listing.images[0]}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{listing.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{listing.location}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Submitted {formatDate(listing.submittedDate)} by {listing.landlordName}
                  </p>
                </div>

                <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:block sm:text-right">
                  <StatusBadge status={listing.status} />
                  <p className="mt-0 text-sm font-semibold text-ink sm:mt-2">
                    {listing.views} views
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="section-card min-w-0">
          <div className="mb-4">
            <p className="text-lg font-extrabold text-ink">Recent activities</p>
            <p className="app-muted">Platform updates, approvals, and moderation events.</p>
          </div>

          <div className="space-y-3">
            {recentActivity.slice(0, 4).map((activity) => (
              <div className="rounded-[18px] border border-slate-100 p-4" key={activity.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{activity.title}</p>
                  <StatusBadge status={activity.badge} />
                </div>
                <p className="mt-2 text-sm text-slate-500">{activity.detail}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">
                  {formatDate(activity.createdAt)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[22px] bg-brand-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
              Notifications
            </p>
            <div className="mt-3 space-y-3">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification.id}>
                  <p className="font-semibold text-ink">{notification.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{notification.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
    </AppShell>
  )
}

export default AdminOverviewPage
