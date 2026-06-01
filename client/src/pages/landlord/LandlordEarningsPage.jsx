import { BarChart3, Clock3, WalletCards } from 'lucide-react'
import StatusBadge from '../../components/common/StatusBadge'
import LandlordChartPlaceholder from '../../components/landlord/LandlordChartPlaceholder'
import AppShell from '../../components/layout/AppShell'
import { useLandlordWorkspace } from './useLandlordWorkspace'

const summaryIcons = [WalletCards, Clock3, BarChart3]

function LandlordEarningsPage() {
  const { chartLabels, chartPoints, summaryCards, transactionRows } = useLandlordWorkspace()

  return (
    <AppShell
      subtitle="Track income performance, pending payouts, and recent landlord transactions."
      title="Earnings"
    >
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryCards.map((card, index) => {
          const Icon = summaryIcons[index]
          return (
            <article className="panel min-w-0 p-4 sm:p-5" key={card.label}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    {card.label}
                  </p>
                  <p className="mt-2 break-words font-display text-xl font-extrabold text-ink sm:text-2xl">
                    {card.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">{card.detail}</p>
                </div>
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 sm:h-11 sm:w-11">
                  <Icon size={20} />
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <article className="section-card min-w-0">
          <div className="mb-4">
            <p className="text-lg font-extrabold text-ink">Payout trend</p>
            <p className="app-muted">A lightweight overview of how earnings are moving.</p>
          </div>
          <LandlordChartPlaceholder labels={chartLabels} points={chartPoints} />
        </article>

        <article className="section-card min-w-0">
          <div className="mb-4">
            <p className="text-lg font-extrabold text-ink">Recent transactions</p>
            <p className="app-muted">Latest processed and pending earnings activity.</p>
          </div>

          {transactionRows.length ? (
            <div className="space-y-3">
              {transactionRows.map((transaction) => (
                <div
                  className="grid gap-3 rounded-[20px] border border-slate-100 p-3 sm:grid-cols-[0.8fr_1.2fr_0.7fr_auto] sm:items-center sm:p-4"
                  key={transaction.id}
                >
                  <p className="text-sm text-slate-500">{transaction.date}</p>
                  <p className="min-w-0 break-words font-semibold text-ink sm:truncate">
                    {transaction.property}
                  </p>
                  <p className="text-sm font-semibold text-ink">{transaction.amount}</p>
                  <div className="sm:text-right">
                    <StatusBadge status={transaction.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
              <p className="text-lg font-bold text-ink">No transactions yet</p>
              <p className="mt-2 text-sm text-slate-500">
                Completed and pending payments will show up here when bookings are processed.
              </p>
            </div>
          )}
        </article>
      </section>
    </AppShell>
  )
}

export default LandlordEarningsPage
