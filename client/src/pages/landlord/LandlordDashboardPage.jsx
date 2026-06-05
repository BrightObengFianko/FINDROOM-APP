import {
  Building2,
  CalendarDays,
  CreditCard,
  MessageCircleMore,
  WalletCards,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../../components/common/StatCard'
import StatusBadge from '../../components/common/StatusBadge'
import ListingPreviewPanel from '../../components/common/ListingPreviewPanel'
import LandlordChartPlaceholder from '../../components/landlord/LandlordChartPlaceholder'
import AppShell from '../../components/layout/AppShell'
import { useAuth } from '../../context/AuthContext'
import { useLandlordWorkspace } from './useLandlordWorkspace'

const statIcons = [Building2, CalendarDays, MessageCircleMore, WalletCards]

function LandlordDashboardPage() {
  const { user } = useAuth()
  const { chartLabels, chartPoints, listings, overviewStats, recentBookings, summaryCards } =
    useLandlordWorkspace()
  const [selectedListingId, setSelectedListingId] = useState('')

  const firstName = user?.name?.split(' ')[0] || 'there'
  const highlightedListing = listings[0]
  const previewListing = listings.find((listing) => listing.id === selectedListingId) || listings[0] || null

  return (
    <AppShell
      actions={
        <Link className="action-button-primary" to="/landlord/listings/new">
          Add listing
        </Link>
      }
      subtitle="Manage listings, bookings, messages, and earnings from the same workspace style."
      title={`Welcome back, ${firstName}!`}
    >
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4">
        {overviewStats.map((stat, index) => (
          <StatCard
            detail={stat.detail}
            icon={statIcons[index]}
            key={stat.label}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="section-card min-w-0">
          <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-extrabold text-ink">Recent bookings</p>
              <p className="app-muted">Latest reservation activity across your listings.</p>
            </div>
            <Link className="text-sm font-semibold text-brand-600" to="/bookings">
              View all
            </Link>
          </div>

          {recentBookings.length ? (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  className="flex flex-col gap-4 rounded-[18px] border border-slate-100 p-3 sm:flex-row sm:items-center sm:rounded-[20px] sm:p-4"
                  key={booking.id}
                >
                  <img
                    alt={booking.property}
                    className="h-20 w-full rounded-[18px] object-cover sm:h-20 sm:w-24 sm:rounded-[20px]"
                    src={booking.image}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{booking.property}</p>
                    <p className="mt-1 text-sm text-slate-500">{booking.guest}</p>
                    <p className="mt-1 text-xs text-slate-400">{booking.dates}</p>
                  </div>

                  <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:block sm:text-right">
                    <StatusBadge status={booking.status} />
                    <p className="mt-0 text-sm font-semibold text-ink sm:mt-2">{booking.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
              <p className="text-lg font-bold text-ink">No bookings yet</p>
              <p className="mt-2 text-sm text-slate-500">
                New reservation requests will appear here as soon as guests start booking.
              </p>
            </div>
          )}
        </article>

        <article className="section-card min-w-0">
          <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-extrabold text-ink">Earnings trend</p>
              <p className="app-muted">A quick view of your recent payout direction.</p>
            </div>
            <Link className="text-sm font-semibold text-brand-600" to="/earnings">
              Open earnings
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {summaryCards.map((card) => (
              <div className="min-w-0 rounded-[20px] bg-slate-50/80 p-3 sm:p-4" key={card.label}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {card.label}
                </p>
                <p className="mt-3 break-words font-display text-xl font-extrabold text-ink sm:text-2xl">
                  {card.value}
                </p>
                <p className="mt-2 text-sm text-slate-500">{card.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <LandlordChartPlaceholder labels={chartLabels} points={chartPoints} />
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="section-card min-w-0">
          <div className="mb-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-extrabold text-ink">Listings snapshot</p>
              <p className="app-muted">Your newest properties and performance details.</p>
            </div>
            <Link className="text-sm font-semibold text-brand-600" to="/landlord/listings">
              Manage listings
            </Link>
          </div>

          <div className="mb-4">
            <ListingPreviewPanel
              badge={previewListing ? <StatusBadge status={previewListing.status} /> : null}
              helperText="Click a listing image below to preview it here."
              image={previewListing?.image}
              imageAlt={previewListing?.title}
              subtitle={previewListing ? previewListing.location : 'No listings to preview.'}
              title={previewListing?.title}
            >
              {previewListing ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Price
                    </p>
                    <p className="mt-1 font-semibold text-ink">{previewListing.price} / month</p>
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
                </div>
              ) : null}
            </ListingPreviewPanel>
          </div>

          {listings.length ? (
            <div className="space-y-3">
              {listings.slice(0, 3).map((listing) => (
                <div
                  className="flex flex-col gap-4 rounded-[18px] border border-slate-100 p-3 md:flex-row md:items-center md:rounded-[20px] md:p-4"
                  key={listing.id}
                >
                  <button
                    aria-label={`Preview ${listing.title}`}
                    className={`overflow-hidden rounded-[18px] border transition md:h-20 md:w-24 md:rounded-[20px] ${
                      previewListing?.id === listing.id
                        ? 'border-brand-400 ring-2 ring-brand-100'
                        : 'border-slate-100 hover:border-brand-200'
                    }`}
                    onClick={() => setSelectedListingId(listing.id)}
                    type="button"
                  >
                    <img
                      alt={listing.title}
                      className="h-20 w-full object-cover md:h-20 md:w-24"
                      src={listing.image}
                    />
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{listing.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{listing.location}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                      <span>{listing.bookings} bookings</span>
                      <span>{listing.views}</span>
                      <span>{listing.earnings} earned</span>
                    </div>
                  </div>

                  <StatusBadge status={listing.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
              <p className="text-lg font-bold text-ink">No listings yet</p>
              <p className="mt-2 text-sm text-slate-500">
                Start by creating your first property listing from the button above.
              </p>
            </div>
          )}
        </article>

        <article className="section-card min-w-0">
          <p className="text-lg font-extrabold text-ink">Workspace shortcuts</p>
          <p className="app-muted mt-1">Jump into the most common landlord actions.</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Link className="rounded-[18px] border border-slate-100 p-3.5 text-left sm:p-4" to="/landlord/listings/new">
              <Building2 className="text-brand-600" size={18} />
              <p className="mt-3 font-semibold text-ink">Create a listing</p>
              <p className="mt-1 text-sm text-slate-500">Set up a new room or property.</p>
            </Link>

            <Link className="rounded-[18px] border border-slate-100 p-3.5 text-left sm:p-4" to="/bookings">
              <CalendarDays className="text-brand-600" size={18} />
              <p className="mt-3 font-semibold text-ink">Review bookings</p>
              <p className="mt-1 text-sm text-slate-500">Track approvals, pending stays, and timing.</p>
            </Link>

            <Link className="rounded-[18px] border border-slate-100 p-3.5 text-left sm:p-4" to="/messages">
              <MessageCircleMore className="text-brand-600" size={18} />
              <p className="mt-3 font-semibold text-ink">Open messages</p>
              <p className="mt-1 text-sm text-slate-500">Reply to guests and keep conversations moving.</p>
            </Link>

            <Link className="rounded-[18px] border border-slate-100 p-3.5 text-left sm:p-4" to="/earnings">
              <CreditCard className="text-brand-600" size={18} />
              <p className="mt-3 font-semibold text-ink">Check payouts</p>
              <p className="mt-1 text-sm text-slate-500">See successful payments and what is still pending.</p>
            </Link>
          </div>

          {highlightedListing ? (
            <div className="mt-5 rounded-[22px] bg-brand-50 p-3.5 sm:p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
                Highlighted listing
              </p>
              <p className="mt-3 text-lg font-extrabold text-ink">{highlightedListing.title}</p>
              <p className="mt-2 text-sm text-slate-600">{highlightedListing.location}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-brand-700">
                <span>{highlightedListing.price} / month</span>
                <span>{highlightedListing.bookings} bookings</span>
              </div>
            </div>
          ) : null}
        </article>
      </section>
    </AppShell>
  )
}

export default LandlordDashboardPage
