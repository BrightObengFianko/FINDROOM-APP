import { ChevronDown, MoveRight } from 'lucide-react'
import LandlordLineChart from '../components/LandlordLineChart'
import LandlordSectionCard from '../components/LandlordSectionCard'
import LandlordStatusBadge from '../components/LandlordStatusBadge'
import { earningsSummary, transactions } from '../data'

function LandlordEarningsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.03em] text-[#111827] sm:text-[30px]">
            Earnings
          </h1>
          <p className="mt-1 text-[14px] text-[#64748b]">
            Track your income and transactions.
          </p>
        </div>

        <button
          className="inline-flex items-center gap-2 rounded-[12px] border border-[#e2e8f0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#475569]"
          type="button"
        >
          This Month
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {earningsSummary.map((item) => (
          <LandlordSectionCard key={item.id}>
            <p className="text-[12px] font-semibold text-[#64748b]">{item.label}</p>
            <p className="mt-2 text-[34px] font-bold leading-none tracking-[-0.03em] text-[#111827]">
              {item.value}
            </p>
            {item.hint ? (
              <p className="mt-3 text-[12px] font-semibold text-[#23933d]">+{item.hint}</p>
            ) : (
              <button
                className="mt-4 inline-flex items-center gap-2 text-[13px] font-semibold text-[#23933d]"
                type="button"
              >
                {item.link}
                <MoveRight size={15} />
              </button>
            )}
          </LandlordSectionCard>
        ))}
      </div>

      <div className="grid gap-4 2xl:grid-cols-[1.08fr_0.92fr]">
        <LandlordSectionCard title="Earnings Overview">
          <LandlordLineChart />
        </LandlordSectionCard>

        <LandlordSectionCard title="Recent Transactions">
          <div className="overflow-hidden rounded-[18px] border border-[#edf2f7]">
            <div className="hidden grid-cols-[0.8fr_1.35fr_0.7fr_0.7fr] gap-4 bg-[#fbfcfd] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8] sm:grid">
              <span>Date</span>
              <span>Property</span>
              <span>Amount</span>
              <span>Status</span>
            </div>

            <div className="divide-y divide-[#edf2f7]">
              {transactions.map((transaction) => (
                <div
                  className="grid gap-3 px-4 py-4 sm:grid-cols-[0.8fr_1.35fr_0.7fr_0.7fr] sm:gap-4 sm:py-3"
                  key={transaction.id}
                >
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.08em] text-[#94a3b8] sm:hidden">
                      Date
                    </p>
                    <p className="text-[12px] text-[#334155]">{transaction.date}</p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-[0.08em] text-[#94a3b8] sm:hidden">
                      Property
                    </p>
                    <p className="text-[12px] font-medium text-[#111827]">{transaction.property}</p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-[0.08em] text-[#94a3b8] sm:hidden">
                      Amount
                    </p>
                    <p className="text-[12px] font-semibold text-[#111827]">{transaction.amount}</p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-[0.08em] text-[#94a3b8] sm:hidden">
                      Status
                    </p>
                    <LandlordStatusBadge status={transaction.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </LandlordSectionCard>
      </div>
    </div>
  )
}

export default LandlordEarningsPage
