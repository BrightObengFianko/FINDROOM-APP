import { Eye, Pencil, Search, SlidersHorizontal, Trash2 } from 'lucide-react'
import LandlordSectionCard from '../components/LandlordSectionCard'
import LandlordStatusBadge from '../components/LandlordStatusBadge'
import { listings } from '../data'

function LandlordListingsPage({ onSelect }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[30px] font-bold tracking-[-0.03em] text-[#111827]">My Listings</h1>
          <p className="mt-1 text-[14px] text-[#64748b]">
            Manage your properties and view their performance.
          </p>
        </div>

        <button
          className="inline-flex items-center justify-center rounded-[12px] bg-[#23933d] px-5 py-3 text-[13px] font-semibold text-white shadow-[0_14px_30px_rgba(36,150,63,0.25)] transition hover:bg-[#1f7f36]"
          onClick={() => onSelect('add-listing')}
          type="button"
        >
          Add New Listing
        </button>
      </div>

      <LandlordSectionCard className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]"
              size={16}
            />
            <input
              className="field h-12 rounded-[12px] pl-11"
              placeholder="Search listings..."
            />
          </div>

          <button
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[12px] border border-[#e2e8f0] px-4 text-[13px] font-medium text-[#475569]"
            type="button"
          >
            <SlidersHorizontal size={16} />
            Filter
          </button>
        </div>

        <div className="overflow-hidden rounded-[20px] border border-[#edf2f7]">
          <div className="hidden grid-cols-[1.65fr_0.55fr_0.55fr_0.7fr_0.7fr_0.6fr] items-center gap-4 bg-[#fbfcfd] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8] lg:grid">
            <span>Property</span>
            <span>Bookings</span>
            <span>Views</span>
            <span>Earnings</span>
            <span>Status</span>
            <span className="text-right">Action</span>
          </div>

          <div className="divide-y divide-[#edf2f7]">
            {listings.map((listing) => (
              <div
                className="grid gap-4 px-5 py-4 lg:grid-cols-[1.65fr_0.55fr_0.55fr_0.7fr_0.7fr_0.6fr] lg:items-center"
                key={listing.id}
              >
                <div className="flex items-center gap-4">
                  <img
                    alt={listing.title}
                    className="h-[66px] w-[92px] rounded-[14px] object-cover"
                    src={listing.image}
                  />
                  <div>
                    <p className="text-[13px] font-semibold text-[#111827]">{listing.title}</p>
                    <p className="mt-1 text-[12px] text-[#64748b]">{listing.location}</p>
                    <p className="mt-1 text-[12px] font-semibold text-[#111827]">
                      {listing.price}{' '}
                      <span className="font-normal text-[#64748b]">{listing.unit}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.08em] text-[#94a3b8] lg:hidden">
                    Bookings
                  </p>
                  <p className="text-[14px] font-semibold text-[#111827]">{listing.bookings}</p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.08em] text-[#94a3b8] lg:hidden">
                    Views
                  </p>
                  <p className="text-[14px] font-semibold text-[#111827]">{listing.views}</p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.08em] text-[#94a3b8] lg:hidden">
                    Earnings
                  </p>
                  <p className="text-[14px] font-semibold text-[#111827]">{listing.earnings}</p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.08em] text-[#94a3b8] lg:hidden">
                    Status
                  </p>
                  <LandlordStatusBadge status={listing.status} />
                </div>

                <div className="flex items-center gap-2 lg:justify-end">
                  {[Eye, Pencil, Trash2].map((Icon, index) => (
                    <button
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] border border-[#e8edf1] text-[#64748b] transition hover:bg-[#f6faf7] hover:text-[#23933d]"
                      key={`${listing.id}-${index}`}
                      type="button"
                    >
                      <Icon size={16} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </LandlordSectionCard>
    </div>
  )
}

export default LandlordListingsPage
