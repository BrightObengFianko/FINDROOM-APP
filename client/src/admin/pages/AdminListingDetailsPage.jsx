import { ArrowLeft, BadgeCheck, XCircle } from 'lucide-react'
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
  const [selectedImage, setSelectedImage] = useState(listing?.images?.[0] || '')
  const [deletedListingSnapshot, setDeletedListingSnapshot] = useState(null)
  const [feedbackModal, setFeedbackModal] = useState({
    open: false,
    title: '',
    description: '',
    primaryActionLabel: 'Close',
    icon: null,
    iconClassName: '',
  })
  const [form, setForm] = useState(() => ({
    title: listing?.title || '',
    price: String(listing?.price || ''),
    location: listing?.location || '',
  }))
  const [formError, setFormError] = useState('')

  const activeListing = listing || deletedListingSnapshot
  const previewImage = activeListing?.images?.includes(selectedImage)
    ? selectedImage
    : activeListing?.images?.[0] || ''

  if (!activeListing) {
    return <Navigate replace to="/admin/listings" />
  }

  const openFeedbackModal = (
    title,
    description,
    primaryActionLabel = 'Close',
    icon = null,
    iconClassName = '',
  ) => {
    setFeedbackModal({
      open: true,
      title,
      description,
      primaryActionLabel,
      icon,
      iconClassName,
    })
  }

  const closeFeedbackModal = () => {
    setFeedbackModal({
      open: false,
      title: '',
      description: '',
      primaryActionLabel: 'Close',
      icon: null,
      iconClassName: '',
    })
  }

  const handleCloseFeedbackModal = () => {
    const shouldRedirect = feedbackModal.title === 'Room deleted'
    closeFeedbackModal()

    if (shouldRedirect) {
      setDeletedListingSnapshot(null)
      navigate('/admin/listings')
    }
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

    saveListing(activeListing.id, {
      title: form.title.trim(),
      price: Number(form.price),
      location: form.location.trim(),
    })
    setFormError('')
    setIsEditing(false)
  }

  const handleApprove = () => {
    updateListingStatus(activeListing.id, 'Approved')
    openFeedbackModal(
      'Room approved',
      `${activeListing.title} has been approved and is now available in Search Rooms.`,
      'Close',
      <BadgeCheck size={24} />,
      'bg-emerald-50 text-emerald-600',
    )
  }

  const handleReject = () => {
    updateListingStatus(activeListing.id, 'Rejected')
    openFeedbackModal(
      'Room rejected',
      `${activeListing.title} has been rejected and will not appear in Search Rooms.`,
      'Close',
      <XCircle size={24} />,
      'bg-rose-50 text-rose-600',
    )
  }

  const handleDelete = () => {
    const listingToDelete = activeListing
    setDeletedListingSnapshot(listingToDelete)
    deleteListing(listingToDelete.id)
    setPendingDeletion(false)
    openFeedbackModal(
      'Room deleted',
      `${listingToDelete.title} has been deleted from the admin workspace.`,
    )
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
              <img
                alt={activeListing.title}
                className="h-[280px] w-full object-cover"
                src={previewImage}
              />
            </div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Click a photo to preview it above
            </p>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {activeListing.images.map((image) => (
                <button
                  className={`overflow-hidden rounded-[18px] border bg-slate-50 transition ${
                    selectedImage === image
                      ? 'border-brand-400 ring-2 ring-brand-100'
                      : 'border-slate-100 hover:border-brand-200'
                  }`}
                  key={image}
                  onClick={() => setSelectedImage(image)}
                  type="button"
                >
                  <img alt={activeListing.title} className="h-24 w-full object-cover" src={image} />
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-[24px] border border-slate-100 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-2xl font-extrabold text-ink">{activeListing.title}</p>
                <p className="mt-2 text-sm text-slate-500">{activeListing.landlordName}</p>
              </div>
              <StatusBadge status={activeListing.status} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Price (GHS)
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {formatCurrency(activeListing.price)} / month
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Location
                </p>
                <p className="mt-1 font-semibold text-ink">{activeListing.location}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Property type
                </p>
                <p className="mt-1 font-semibold text-ink">{activeListing.propertyType}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Submitted on
                </p>
                <p className="mt-1 font-semibold text-ink">{formatDate(activeListing.submittedDate)}</p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Description
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-500">{activeListing.description}</p>
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Amenities
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {activeListing.amenities.map((amenity) => (
                  <span className="pill" key={amenity}>
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button className="action-button-primary" onClick={handleApprove} type="button">
                Approve
              </button>
              <button
                className="action-button-secondary"
                onClick={() => setIsEditing(true)}
                type="button"
              >
                Edit Listing
              </button>
              <button className="action-button-secondary" onClick={handleReject} type="button">
                Reject
              </button>
              <button
                className="action-button-secondary"
                onClick={() => setPendingDeletion(true)}
                type="button"
              >
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
                onChange={(event) =>
                  setForm((current) => ({ ...current, location: event.target.value }))
                }
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
        description={`Delete ${activeListing.title} from the admin workspace?`}
        onPrimaryAction={handleDelete}
        onSecondaryAction={() => setPendingDeletion(false)}
        open={pendingDeletion}
        primaryActionClassName="action-button-secondary border-rose-200 text-rose-600 hover:bg-rose-50"
        primaryActionLabel="Delete listing"
        title="Delete listing"
      />

      <AdminModal
        description={feedbackModal.description}
        icon={feedbackModal.icon}
        iconClassName={feedbackModal.iconClassName}
        onPrimaryAction={handleCloseFeedbackModal}
        onSecondaryAction={handleCloseFeedbackModal}
        open={feedbackModal.open}
        primaryActionLabel={feedbackModal.primaryActionLabel}
        title={feedbackModal.title}
      />
    </AppShell>
  )
}

export default AdminListingDetailsPage
