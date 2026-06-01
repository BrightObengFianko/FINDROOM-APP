import { ArrowLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import StatusBadge from '../../components/common/StatusBadge'
import { formatCurrency, formatDate } from '../../utils/format'
import AdminModal from '../components/AdminModal'
import { useAdminWorkspace } from '../hooks/useAdminWorkspace'

function AdminListingDetailsPage() {
  const { listingId } = useParams()
  const navigate = useNavigate()
  const { listings, deleteListing, saveListing, updateListingStatus } = useAdminWorkspace()
  const listing = useMemo(
    () => listings.find((candidate) => candidate.id === listingId),
    [listingId, listings],
  )
  const [isEditing, setIsEditing] = useState(false)
  const [pendingDeletion, setPendingDeletion] = useState(false)
  const [form, setForm] = useState(() => ({
    title: listing?.title || '',
    price: String(listing?.price || ''),
    location: listing?.location || '',
  }))
  const [formError, setFormError] = useState('')

  if (!listing) {
    return <Navigate replace to="/admin/listings" />
  }

  const handleSave = () => {
    if (!form.title.trim()) {
      setFormError('Listing title is required.')
      return
    }

    if (!Number(form.price) || Number(form.price) <= 0) {
      setFormError('Enter a valid listing price.')
      return
    }

    saveListing(listing.id, {
      title: form.title.trim(),
      price: Number(form.price),
      location: form.location.trim(),
    })
    setFormError('')
    setIsEditing(false)
  }

  return (
    <AppShell subtitle="Review listing details and moderation controls." title="Listing Detail">
      <section className="section-card">
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500"
          to="/admin/listings"
        >
          <ArrowLeft size={16} />
          Back to Listings
        </Link>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.95fr]">
          <article className="min-w-0">
            <div className="overflow-hidden rounded-[24px] border border-slate-100 bg-slate-50">
              <img alt={listing.title} className="h-[280px] w-full object-cover" src={listing.images[0]} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {listing.images.map((image) => (
                <div className="overflow-hidden rounded-[18px] border border-slate-100 bg-slate-50" key={image}>
                  <img alt={listing.title} className="h-24 w-full object-cover" src={image} />
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[24px] border border-slate-100 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-2xl font-extrabold text-ink">{listing.title}</p>
                <p className="mt-2 text-sm text-slate-500">{listing.landlordName}</p>
              </div>
              <StatusBadge status={listing.status} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Price (GHS)</p>
                <p className="mt-1 font-semibold text-ink">{formatCurrency(listing.price)} / month</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Location</p>
                <p className="mt-1 font-semibold text-ink">{listing.location}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Property type</p>
                <p className="mt-1 font-semibold text-ink">{listing.propertyType}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Submitted on</p>
                <p className="mt-1 font-semibold text-ink">{formatDate(listing.submittedDate)}</p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Description</p>
              <p className="mt-2 text-sm leading-7 text-slate-500">{listing.description}</p>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Amenities</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {listing.amenities.map((amenity) => (
                  <span className="pill" key={amenity}>
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                className="action-button-primary"
                onClick={() => updateListingStatus(listing.id, 'Approved')}
                type="button"
              >
                Approve
              </button>
              <button className="action-button-secondary" onClick={() => setIsEditing(true)} type="button">
                Edit Listing
              </button>
              <button
                className="action-button-secondary"
                onClick={() => updateListingStatus(listing.id, 'Rejected')}
                type="button"
              >
                Reject
              </button>
              <button className="action-button-secondary" onClick={() => setPendingDeletion(true)} type="button">
                Delete
              </button>
            </div>
          </article>
        </div>
      </section>

      <AdminModal
        description="Update the listing details used by the admin workspace."
        onPrimaryAction={handleSave}
        onSecondaryAction={() => {
          setIsEditing(false)
          setFormError('')
        }}
        open={isEditing}
        primaryActionLabel="Save changes"
        title="Edit listing"
      >
        <div className="grid gap-4">
          <label className="block text-sm font-semibold text-slate-600">
            Title
            <input
              className="field mt-2"
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              value={form.title}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-600">
              Price (GHS)
              <input
                className="field mt-2"
                min="1"
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                type="number"
                value={form.price}
              />
            </label>
            <label className="block text-sm font-semibold text-slate-600">
              Location
              <input
                className="field mt-2"
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                value={form.location}
              />
            </label>
          </div>

          {formError ? (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div>
          ) : null}
        </div>
      </AdminModal>

      <AdminModal
        description={`Delete ${listing.title} from the admin workspace?`}
        onPrimaryAction={() => {
          deleteListing(listing.id)
          setPendingDeletion(false)
          navigate('/admin/listings')
        }}
        onSecondaryAction={() => setPendingDeletion(false)}
        open={pendingDeletion}
        primaryActionClassName="action-button-secondary border-rose-200 text-rose-600 hover:bg-rose-50"
        primaryActionLabel="Delete listing"
        title="Delete listing"
      />
    </AppShell>
  )
}

export default AdminListingDetailsPage
