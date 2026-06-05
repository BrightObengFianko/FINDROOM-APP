import { Eye, Pencil, Search, SlidersHorizontal, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import LandlordSectionCard from '../components/LandlordSectionCard'
import LandlordStatusBadge from '../components/LandlordStatusBadge'
import ListingPreviewPanel from '../../components/common/ListingPreviewPanel'
import { listings } from '../data'

function LandlordListingsPage({ onSelect }) {
  const [query, setQuery] = useState('')
  const [selectedListingId, setSelectedListingId] = useState('')

  const filteredListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return listings
    }

    return listings.filter((listing) =>
      `${listing.title} ${listing.location}`.toLowerCase().includes(normalizedQuery),
    )
  }, [query])

  const previewListing =
    filteredListings.find((listing) => listing.id === selectedListingId) || filteredListings[0] || null

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
              onChange={(event) => setQuery(event.target.value)}
              value={query}
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
          <div className="border-b border-[#edf2f7] p-4 sm:p-5">
            <ListingPreviewPanel
              badge={
                previewListing ? (
                  <LandlordStatusBadge
                    status={previewListing.status === 'Pending' ? 'Pending review' : previewListing.status}
                  />
                ) : null
              }
              helperText="Click a photo in the table to preview it above."
              image={previewListing?.image}
              imageAlt={previewListing?.title}
              imageClassName="h-52 sm:h-56"
              subtitle={previewListing ? previewListing.location : 'No listings available to preview.'}
              title={previewListing?.title}
            >
              {previewListing ? (
                <div className="grid gap-3 sm:grid-cols-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Monthly rent
                    </p>
                    <p className="mt-1 font-semibold text-ink">
                      {previewListing.price} <span className="font-normal text-slate-500">{previewListing.unit}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Bookings
                    </p>
                    <p className="mt-1 font-semibold text-ink">{previewListing.bookings}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Views
                    </p>
                    <p className="mt-1 font-semibold text-ink">{previewListing.views}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Earnings
                    </p>
                    <p className="mt-1 font-semibold text-ink">{previewListing.earnings}</p>
                  </div>
                </div>
              ) : null}
            </ListingPreviewPanel>
          </div>

          <div className="hidden grid-cols-[1.65fr_0.55fr_0.55fr_0.7fr_0.7fr_0.6fr] items-center gap-4 bg-[#fbfcfd] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94a3b8] lg:grid">
            <span>Property</span>
            <span>Bookings</span>
            <span>Views</span>
            <span>Earnings</span>
            <span>Status</span>
            <span className="text-right">Action</span>
          </div>

          <div className="divide-y divide-[#edf2f7]">
            {filteredListings.map((listing) => (
              <div
                className="grid gap-4 px-5 py-4 lg:grid-cols-[1.65fr_0.55fr_0.55fr_0.7fr_0.7fr_0.6fr] lg:items-center"
                key={listing.id}
              >
                <div className="flex items-center gap-4">
                  <button
                    aria-label={`Preview ${listing.title}`}
                    className={`overflow-hidden rounded-[14px] border transition ${
                      previewListing?.id === listing.id
                        ? 'border-[#23933d] ring-2 ring-[#d9f0de]'
                        : 'border-[#edf2f7] hover:border-[#cfe3d4]'
                    }`}
                    onClick={() => setSelectedListingId(listing.id)}
                    type="button"
                  >
                    <img
                      alt={listing.title}
                      className="h-[66px] w-[92px] object-cover"
                      src={listing.image}
                    />
                  </button>
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
                  <LandlordStatusBadge
                    status={listing.status === 'Pending' ? 'Pending review' : listing.status}
                  />
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
