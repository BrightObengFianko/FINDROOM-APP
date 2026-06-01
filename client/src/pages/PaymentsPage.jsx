import { useMemo, useState } from 'react'
import AppShell from '../components/layout/AppShell'
import StatusBadge from '../components/common/StatusBadge'
import { useAppData } from '../context/AppDataContext'
import { formatCurrency, formatDate } from '../utils/format'

const tabs = ['all', 'successful', 'pending', 'failed']

function PaymentsPage() {
  const { bookings, payments, runMockPayment } = useAppData()
  const [activeTab, setActiveTab] = useState('all')

  const filteredPayments = useMemo(
    () =>
      activeTab === 'all'
        ? payments
        : payments.filter((payment) => payment.status === activeTab),
    [activeTab, payments],
  )

  const pendingPaymentBooking = bookings.find((booking) => booking.status === 'pending')

  return (
    <AppShell
      title="Payments"
      subtitle="Review payment history and complete mock checkout actions."
      actions={
        <button
          className="action-button-primary"
          disabled={!pendingPaymentBooking}
          onClick={() => runMockPayment({ bookingId: pendingPaymentBooking.id })}
          type="button"
        >
          Pay pending booking
        </button>
      }
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
          {filteredPayments.map((payment) => (
            <div className="grid gap-3 rounded-[18px] border border-slate-100 p-4 sm:grid-cols-[1.2fr_0.7fr_0.6fr_0.6fr]" key={payment.id}>
              <div>
                <p className="font-semibold text-ink">{payment.method}</p>
                <p className="mt-1 text-sm text-slate-500">Reference #{payment.id.slice(0, 8)}</p>
              </div>
              <p className="text-sm font-semibold text-ink">{formatCurrency(payment.amount)}</p>
              <p className="text-sm text-slate-500">{formatDate(payment.createdAt)}</p>
              <div className="sm:text-right">
                <StatusBadge status={payment.status} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  )
}

export default PaymentsPage
