import { Eye, Pencil, Plus, Search, SlidersHorizontal, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import StatusBadge from '../../components/common/StatusBadge'
import { useAppData } from '../../context/AppDataContext'
import AppShell from '../../components/layout/AppShell'
import { useLandlordWorkspace } from './useLandlordWorkspace'

const normalizeStatusKey = (status = '') => String(status || '').trim().toLowerCase()

const formatListingStatusLabel = (status = '') => {
  const normalizedStatus = normalizeStatusKey(status)

  if (normalizedStatus === 'approved') {
    return 'Active'
  }

  if (!normalizedStatus) {
    return 'Pending'
  }

  return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)
}

const formatBookingStatusLabel = (status = '') => {
  const normalizedStatus = normalizeStatusKey(status)

  if (normalizedStatus === 'approved') {
    return 'Confirmed'
  }

  if (!normalizedStatus) {
    return 'Pending'
  }

  return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)
}

const getBookingPriority = (status = '') => {
  const normalizedStatus = normalizeStatusKey(status)

  if (['approved', 'pending', 'active'].includes(normalizedStatus)) {
    return 0
  }

  if (normalizedStatus === 'completed') {
    return 1
  }

  return 2
}

function LandlordListingsPage() {
  const { listings } = useLandlordWorkspace()
  const navigate = useNavigate()
  const { bookings, deleteListing } = useAppData()
  const [query, setQuery] = useState('')

  const filteredListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return listings
    }

    return listings.filter((listing) =>
      `${listing.title} ${listing.location} ${listing.roomType || ''}`.toLowerCase().includes(normalizedQuery),
    )
  }, [listings, query])

  const listingRows = useMemo(
    () =>
      filteredListings.map((listing) => {
        const primaryBooking = [...bookings]
          .filter((booking) => booking.roomId === listing.id)
          .sort((first, second) => {
            const priorityDifference =
              getBookingPriority(first.status) - getBookingPriority(second.status)

            if (priorityDifference !== 0) {
              return priorityDifference
            }

            return new Date(first.startDate || 0).valueOf() - new Date(second.startDate || 0).valueOf()
          })[0]

        const shouldUseBookingStatus =
          primaryBooking && ['approved', 'pending', 'active'].includes(normalizeStatusKey(primaryBooking.status))

        return {
          ...listing,
          bookingsLabel: `${listing.bookings ?? 0}`,
          monthlyPrice: `${listing.price} ${listing.unit}`.trim(),
          ratingLabel: String(listing.views ?? '--').replace(/\s*rating$/i, ''),
          statusLabel: shouldUseBookingStatus
            ? formatBookingStatusLabel(primaryBooking.status)
            : formatListingStatusLabel(listing.status),
        }
      }),
    [bookings, filteredListings],
  )

  const handleView = (listingId) => {
    navigate(`/rooms/${listingId}`)
  }

  const handleEdit = (listingId) => {
    navigate(`/landlord/listings/${listingId}/edit`)
  }

  const handleDelete = async (listing) => {
    const confirmed = window.confirm(`Delete "${listing.title}" from your listings?`)

    if (!confirmed) {
      return
    }

    await deleteListing(listing.id)
  }

  return (
    <AppShell
      actions={
        <Link className="action-button-primary" to="/landlord/listings/new">
          Add listing
        </Link>
      }
      subtitle="Manage your current properties, pricing, and performance from one responsive view."
      title="My Listings"
    >
      <section className="section-card">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <label className="relative block flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              className="field pl-11"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search listings..."
              value={query}
            />
          </label>

          <button className="action-button-secondary w-full justify-center sm:w-auto" type="button">
            <SlidersHorizontal size={16} />
            Filter
          </button>
        </div>

        {listingRows.length ? (
          <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white sm:rounded-[22px]">
            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full table-fixed">
                <colgroup>
                  <col style={{ width: '76px' }} />
                  <col />
                  <col style={{ width: '132px' }} />
                  <col style={{ width: '92px' }} />
                  <col style={{ width: '92px' }} />
                  <col style={{ width: '128px' }} />
                  <col style={{ width: '136px' }} />
                </colgroup>

                <thead className="bg-slate-50/90">
                  <tr>
                    <th className="px-2.5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:px-3">
                      Photo
                    </th>
                    <th className="border-l border-slate-100 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:px-4">
                      Listing
                    </th>
                    <th className="border-l border-slate-100 px-2 py-3 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:px-3">
                      Monthly rent
                    </th>
                    <th className="border-l border-slate-100 px-2 py-3 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:px-3">
                      Bookings
                    </th>
                    <th className="border-l border-slate-100 px-2 py-3 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:px-3">
                      Views
                    </th>
                    <th className="border-l border-slate-100 px-2 py-3 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:px-3">
                      Status
                    </th>
                    <th className="border-l border-slate-100 px-3 py-3 text-right text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:px-4">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {listingRows.map((listing) => (
                    <tr className="align-middle" key={listing.id}>
                      <td className="px-2.5 py-2.5 align-middle sm:px-3 sm:py-3">
                        <img
                          alt={listing.title}
                          className="h-12 w-12 rounded-lg object-cover sm:h-14 sm:w-14 sm:rounded-xl"
                          src={listing.image}
                        />
                      </td>

                      <td className="min-w-0 border-l border-slate-100 px-3 py-2.5 align-middle sm:px-4 sm:py-3">
                        <p className="truncate text-[13px] font-semibold text-ink sm:text-sm xl:text-[15px]">
                          {listing.title}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-slate-600 sm:text-[12px] lg:text-[13px]">
                          {listing.location}
                        </p>
                      </td>

                      <td className="border-l border-slate-100 px-2 py-2.5 text-center align-middle sm:px-3 sm:py-3">
                        <p className="truncate text-[13px] font-semibold text-ink sm:text-sm lg:text-[13px] xl:text-[14px]">
                          {listing.monthlyPrice}
                        </p>
                      </td>

                      <td className="border-l border-slate-100 px-2 py-2.5 text-center align-middle sm:px-3 sm:py-3">
                        <p className="text-[13px] font-semibold text-ink sm:text-sm xl:text-[15px]">
                          {listing.bookingsLabel}
                        </p>
                      </td>

                      <td className="border-l border-slate-100 px-2 py-2.5 text-center align-middle sm:px-3 sm:py-3">
                        <p className="truncate text-[13px] text-slate-600 sm:text-sm lg:text-[13px] xl:text-[14px]">
                          {listing.ratingLabel}
                        </p>
                      </td>

                      <td className="border-l border-slate-100 px-2 py-2.5 align-middle sm:px-3 sm:py-3">
                        <div className="flex justify-center">
                          <StatusBadge status={listing.statusLabel} />
                        </div>
                      </td>

                      <td className="border-l border-slate-100 px-3 py-2.5 align-middle sm:px-4 sm:py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            aria-label={`View ${listing.title}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 sm:h-8 sm:w-8"
                            onClick={() => handleView(listing.id)}
                            type="button"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            aria-label={`Edit ${listing.title}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 sm:h-8 sm:w-8"
                            onClick={() => handleEdit(listing.id)}
                            type="button"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            aria-label={`Delete ${listing.title}`}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-rose-600 sm:h-8 sm:w-8"
                            onClick={() => handleDelete(listing)}
                            type="button"
                          >
                            <Trash2 size={14} />
                          </button>
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
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600">
              <Plus size={24} />
            </div>
            <p className="mt-4 text-lg font-bold text-ink">No listings match this search</p>
            <p className="mt-2 text-sm text-slate-500">
              Try a different keyword or create a fresh property listing.
            </p>
            <Link className="action-button-primary mt-5" to="/landlord/listings/new">
              Add listing
            </Link>
          </div>
        )}
      </section>
    </AppShell>
  )
}

export default LandlordListingsPage
