import { CalendarRange, Download } from 'lucide-react'
import { useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import StatusBadge from '../../components/common/StatusBadge'
import AdminDonutChart from '../components/AdminDonutChart'
import AdminLineChart from '../components/AdminLineChart'
import AdminMetricCard from '../components/AdminMetricCard'
import { useAdminWorkspace } from '../hooks/useAdminWorkspace'

function AdminReportsPage() {
  const { overviewCards, recentActivity, bookingStatusCounts, reportsSummary } = useAdminWorkspace()
  const [lastExportedAt, setLastExportedAt] = useState('')

  const exportSummary = () => {
    setLastExportedAt(
      new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date()),
    )
  }

  return (
    <AppShell
      actions={
        <div className="flex flex-wrap gap-3">
          <button className="action-button-secondary justify-center" type="button">
            <CalendarRange size={16} />
            {reportsSummary.dateRangeLabel}
          </button>
          <button className="action-button-primary" onClick={exportSummary} type="button">
            <Download size={16} />
            Export
          </button>
        </div>
      }
      subtitle="Track revenue, booking trends, and listing performance across the platform."
      title="Reports"
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard
          actionLabel="Updated live"
          detail="Total platform revenue"
          label="Total Revenue"
          value={reportsSummary.totalRevenue}
        />
        <AdminMetricCard
          actionLabel="View bookings"
          detail="All reservation records"
          label="Total Bookings"
          value={reportsSummary.totalBookings}
        />
        <AdminMetricCard
          actionLabel="View listings"
          detail="Active moderation inventory"
          label="Total Listings"
          value={reportsSummary.totalListings}
        />
        <AdminMetricCard
          actionLabel="New accounts"
          detail="Recently registered users"
          label="New Users"
          value={reportsSummary.newUsers}
        />
      </section>

      {lastExportedAt ? (
        <section className="rounded-[22px] border border-brand-100 bg-brand-50 px-5 py-4 text-sm text-brand-700">
          Report export prepared on {lastExportedAt}.
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.95fr]">
        <article className="section-card min-w-0">
          <div className="mb-4">
            <p className="text-lg font-extrabold text-ink">Booking overview</p>
            <p className="app-muted">Revenue trend across the selected reporting range.</p>
          </div>
          <AdminLineChart points={reportsSummary.revenueSeries} />
        </article>

        <article className="section-card min-w-0">
          <div className="mb-4">
            <p className="text-lg font-extrabold text-ink">Listings by status</p>
            <p className="app-muted">A quick breakdown of approvals and moderation results.</p>
          </div>
          <AdminDonutChart segments={reportsSummary.listingBreakdown} />
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="section-card">
          <div className="mb-4">
            <p className="text-lg font-extrabold text-ink">Booking status summary</p>
            <p className="app-muted">Current reservation flow across all bookings.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Upcoming', value: bookingStatusCounts.upcoming, status: 'Upcoming' },
              { label: 'Ongoing', value: bookingStatusCounts.ongoing, status: 'Ongoing' },
              { label: 'Completed', value: bookingStatusCounts.completed, status: 'Completed' },
              { label: 'Cancelled', value: bookingStatusCounts.cancelled, status: 'Cancelled' },
            ].map((item) => (
              <div className="rounded-[20px] border border-slate-100 p-4" key={item.label}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{item.label}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-4 text-3xl font-extrabold text-ink">{item.value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="section-card">
          <div className="mb-4">
            <p className="text-lg font-extrabold text-ink">Recent platform activity</p>
            <p className="app-muted">Recent moderation and operations events from the workspace.</p>
          </div>

          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((activity) => (
              <div className="rounded-[20px] border border-slate-100 p-4" key={activity.id}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-semibold text-ink">{activity.title}</p>
                  <StatusBadge status={activity.badge} />
                </div>
                <p className="mt-2 text-sm text-slate-500">{activity.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AppShell>
  )
}

export default AdminReportsPage
