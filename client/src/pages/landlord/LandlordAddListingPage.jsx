import { ImageUp, Plus, Upload } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { useAppData } from '../../context/AppDataContext'
import { useAuth } from '../../context/AuthContext'
import { amenityCatalog } from '../../data/mockData'
import {
  canCreateLandlordListings,
  getLandlordVerificationStatus,
} from '../../utils/landlordVerification'

const imageSlotCount = 4
const landlordRoomTypeOptions = [
  'Single Room',
  'Single Self-Contain',
  'Chamber and Hall',
  'Private Room',
  'Shared Room',
]

const defaultForm = {
  title: '',
  location: '',
  digitalAddress: '',
  price: '',
  roomType: '',
  description: '',
  amenities: [],
}

function LandlordAddListingPage() {
  const navigate = useNavigate()
  const { listingId } = useParams()
  const { user } = useAuth()
  const { createListing, rooms, updateListing } = useAppData()
  const fileInputRef = useRef(null)
  const isEditing = Boolean(listingId)
  const listingToEdit = useMemo(
    () => rooms.find((room) => room.id === listingId),
    [listingId, rooms],
  )
  const [uploadedImages, setUploadedImages] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdListing, setCreatedListing] = useState(null)
  const [uploadError, setUploadError] = useState('')
  const [form, setForm] = useState(defaultForm)
  const verificationStatus = getLandlordVerificationStatus(user)

  useEffect(
    () => () => {
      uploadedImages.forEach((image) => {
        if (image.isObjectUrl) {
          URL.revokeObjectURL(image.previewUrl)
        }
      })
    },
    [uploadedImages],
  )

  useEffect(() => {
    if (!isEditing || !listingToEdit) {
      return
    }

    setForm({
      title: listingToEdit.title || '',
      location: [listingToEdit.area, listingToEdit.location].filter(Boolean).join(', '),
      digitalAddress: listingToEdit.digitalAddress || '',
      price: String(listingToEdit.price || ''),
      roomType: listingToEdit.roomType || '',
      description: listingToEdit.description || '',
      amenities: listingToEdit.amenities || [],
    })
    setUploadedImages(
      (listingToEdit.images || []).slice(0, imageSlotCount).map((image, index) => ({
        id: `existing-${listingToEdit.id}-${index}`,
        file: null,
        isObjectUrl: false,
        previewUrl: image,
      })),
    )
    setUploadError('')
  }, [isEditing, listingToEdit])

  const applySelectedFiles = (fileList) => {
    const nextImages = Array.from(fileList || [])
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, imageSlotCount)
      .map((file) => ({
        id: `${file.name}-${file.lastModified}`,
        file,
        isObjectUrl: true,
        previewUrl: URL.createObjectURL(file),
      }))

    setUploadedImages(nextImages)
    setUploadError('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    applySelectedFiles(event.dataTransfer.files)
  }

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleAmenityToggle = (amenity) => {
    setForm((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity],
    }))
  }

  const resetForm = () => {
    setForm(defaultForm)
    setUploadedImages([])
    setUploadError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!uploadedImages.length) {
      setUploadError('Please upload at least one image before submitting.')
      openFilePicker()
      return
    }

    setIsSubmitting(true)

    try {
      if (isEditing && listingToEdit) {
        const listing = await updateListing(listingToEdit.id, {
          title: form.title,
          location: form.location,
          digitalAddress: form.digitalAddress,
          price: form.price,
          roomType: form.roomType,
          description: form.description,
          amenities: form.amenities,
          imageFiles: uploadedImages.map((image) => image.file).filter(Boolean),
        })

        if (listing) {
          navigate('/landlord/listings')
        }
      } else {
        const listing = await createListing({
          title: form.title,
          location: form.location,
          digitalAddress: form.digitalAddress,
          price: form.price,
          roomType: form.roomType,
          description: form.description,
          amenities: form.amenities,
          imageFiles: uploadedImages.map((image) => image.file).filter(Boolean),
        })

        if (listing) {
          setCreatedListing(listing)
          resetForm()
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const emptySlotCount = Math.max(imageSlotCount - uploadedImages.length, 0)

  if (!isEditing && !canCreateLandlordListings(user)) {
    return (
      <AppShell
        subtitle="Complete landlord verification before adding a new property listing."
        title="Verification required"
      >
        <section className="section-card text-center">
          <p className="text-lg font-bold text-ink">
            {verificationStatus === 'pending'
              ? 'Your landlord verification is under review.'
              : 'Verify your landlord profile before listing a property.'}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {verificationStatus === 'pending'
              ? 'Our team is reviewing your submitted documents. You will be able to publish new listings as soon as the review is approved.'
              : 'Upload your identity, property, and contact details so we can approve your landlord account.'}
          </p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <Link className="action-button-secondary justify-center" to="/dashboard">
              Back to dashboard
            </Link>
            <Link
              className="action-button-primary justify-center"
              to={
                verificationStatus === 'pending'
                  ? '/landlord/verification/submitted'
                  : '/landlord/verification'
              }
            >
              {verificationStatus === 'pending' ? 'Check verification status' : 'Start verification'}
            </Link>
          </div>
        </section>
      </AppShell>
    )
  }

  if (isEditing && !listingToEdit) {
    return (
      <AppShell
        subtitle="Return to your listings to choose another property."
        title="Listing not found"
      >
        <section className="section-card text-center">
          <p className="text-sm text-slate-500">
            This listing is no longer available to edit.
          </p>
          <Link className="action-button-primary mt-5" to="/landlord/listings">
            Back to listings
          </Link>
        </section>
      </AppShell>
    )
  }

  return (
    <AppShell
      subtitle={
        isEditing
          ? 'Update your property details with the same shared dashboard patterns used across FindRoom.'
          : 'Build a new property listing with the same shared dashboard patterns used across FindRoom.'
      }
      title={isEditing ? 'Edit Listing' : 'Add Listing'}
    >
      <section className="section-card">
        <form className="grid gap-5 sm:gap-6 xl:grid-cols-[1.05fr_0.95fr]" onSubmit={handleSubmit}>
          <div className="min-w-0 space-y-4">
            <label className="block text-sm font-semibold text-slate-600">
              Property name
              <input
                className="field mt-2"
                onChange={(event) => handleChange('title', event.target.value)}
                placeholder="Enter property name"
                required
                value={form.title}
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-600">
                Location
                <input
                  className="field mt-2"
                  onChange={(event) => handleChange('location', event.target.value)}
                  placeholder="Area and city"
                  required
                  value={form.location}
                />
              </label>

              <label className="block text-sm font-semibold text-slate-600">
                Digital address
                <input
                  className="field mt-2"
                  onChange={(event) => handleChange('digitalAddress', event.target.value)}
                  placeholder="GA-123-4567"
                  required
                  value={form.digitalAddress}
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-600">
                Price per month (GHS)
                <input
                  className="field mt-2"
                  min="1"
                  onChange={(event) => handleChange('price', event.target.value)}
                  placeholder="900"
                  required
                  type="number"
                  value={form.price}
                />
                <span className="mt-1 block text-xs font-medium text-slate-400">
                  Enter the monthly rent in Ghana cedis.
                </span>
              </label>

              <label className="block text-sm font-semibold text-slate-600">
                Property type
                <select
                  className="field mt-2"
                  onChange={(event) => handleChange('roomType', event.target.value)}
                  required
                  value={form.roomType}
                >
                  <option disabled value="">
                    Select property type
                  </option>
                  {landlordRoomTypeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block text-sm font-semibold text-slate-600">
              Description
              <textarea
                className="field mt-2 min-h-36"
                onChange={(event) => handleChange('description', event.target.value)}
                placeholder="Describe the room, amenities, and what makes the property stand out."
                value={form.description}
              />
            </label>
          </div>

          <div className="min-w-0 space-y-5">
            <div>
              <p className="text-sm font-semibold text-slate-600">Upload images</p>
              <input
                accept="image/*"
                className="hidden"
                multiple
                onChange={(event) => applySelectedFiles(event.target.files)}
                ref={fileInputRef}
                type="file"
              />
              <div
                className={`mt-2 rounded-[20px] border border-dashed px-4 py-8 text-center transition sm:rounded-[24px] sm:px-6 sm:py-10 ${
                  isDragging
                    ? 'border-brand-400 bg-brand-50'
                    : 'border-brand-200 bg-brand-50/40'
                }`}
                onClick={openFilePicker}
                onDragLeave={() => setIsDragging(false)}
                onDragOver={(event) => {
                  event.preventDefault()
                  setIsDragging(true)
                }}
                onDrop={handleDrop}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    openFilePicker()
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-brand-200 bg-white text-brand-600 sm:h-14 sm:w-14">
                  {uploadedImages.length ? <Upload size={24} /> : <Plus size={24} />}
                </div>
                <p className="mt-4 font-semibold text-ink">
                  {uploadedImages.length ? 'Change uploaded photos' : 'Drop photos here'}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Drag and drop or click to upload from your phone or laptop
                </p>
                {uploadedImages.length ? (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
                    {uploadedImages.length} image{uploadedImages.length === 1 ? '' : 's'} selected
                  </p>
                ) : null}
              </div>
              {uploadError ? (
                <p className="mt-2 text-sm font-medium text-rose-600">{uploadError}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
              {uploadedImages.map((image, index) => (
                <button
                  className="relative h-20 overflow-hidden rounded-[18px] border border-slate-200 bg-slate-50 sm:h-24"
                  key={image.id}
                  onClick={openFilePicker}
                  type="button"
                >
                  <img
                    alt={`Uploaded property preview ${index + 1}`}
                    className="h-full w-full object-cover"
                    src={image.previewUrl}
                  />
                  <span className="absolute bottom-2 left-2 rounded-full bg-slate-950/65 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                    Photo {index + 1}
                  </span>
                </button>
              ))}

              {Array.from({ length: emptySlotCount }).map((_, slotIndex) => (
                <button
                  className="grid h-20 place-items-center rounded-[18px] border border-slate-200 bg-slate-50 text-slate-300 transition hover:border-brand-200 hover:text-brand-500 sm:h-24"
                  key={`empty-slot-${slotIndex}`}
                  onClick={openFilePicker}
                  type="button"
                >
                  <ImageUp size={28} />
                </button>
              ))}
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600">Amenities</p>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2 sm:gap-3">
                {amenityCatalog.map((amenity) => (
                  <label className="flex items-center gap-3 text-sm text-slate-600" key={amenity}>
                    <input
                      checked={form.amenities.includes(amenity)}
                      className="h-4 w-4 rounded border-slate-300 text-brand-600"
                      onChange={() => handleAmenityToggle(amenity)}
                      type="checkbox"
                    />
                    <span>{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end sm:pt-5">
              <Link className="action-button-secondary w-full justify-center sm:w-auto" to="/landlord/listings">
                Cancel
              </Link>
              <button
                className="action-button-primary w-full justify-center sm:w-auto"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (isEditing ? 'Saving...' : 'Submitting...') : isEditing ? 'Save changes' : 'Submit listing'}
              </button>
            </div>
          </div>
        </form>
      </section>

      {!isEditing && createdListing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/30 px-4 py-4 sm:items-center">
          <div className="panel w-full max-w-md p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
              Success
            </p>
            <h2 className="mt-3 text-xl font-extrabold text-ink sm:text-2xl">
              Listing submitted successfully
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {createdListing.title} is now available in search listings and your landlord dashboard.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                className="action-button-secondary w-full justify-center sm:w-auto"
                onClick={() => setCreatedListing(null)}
                type="button"
              >
                Close
              </button>
              <button
                className="action-button-primary w-full justify-center sm:w-auto"
                onClick={() => navigate('/rooms')}
                type="button"
              >
                View search listings
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  )
}

export default LandlordAddListingPage
