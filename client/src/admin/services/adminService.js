import { adminWorkspaceSeed } from '../data/mockAdminWorkspace'

const ADMIN_WORKSPACE_STORAGE_KEY = 'findroom-admin-workspace'
const ADMIN_WORKSPACE_SYNC_EVENT = 'findroom-admin-workspace-sync'

const cloneSeed = () => JSON.parse(JSON.stringify(adminWorkspaceSeed))

const normalizeLookupValue = (value = '') => String(value).trim().toLowerCase()

const normalizeListingStatus = (value = '') => {
  const normalized = String(value || '').trim().toLowerCase()

  if (!normalized) {
    return 'Pending'
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

const formatListingLocation = (listing = {}) =>
  [...new Set([listing.area, listing.location].filter(Boolean))].join(', ') ||
  listing.location ||
  listing.area ||
  'Location unavailable'

const mapToWorkspaceListing = (listing, existingListing = null) => ({
  ...existingListing,
  id: listing.id || existingListing?.id || `listing-admin-${Date.now()}`,
  title: listing.title || existingListing?.title || 'Untitled listing',
  landlordId: listing.landlordId || existingListing?.landlordId || '',
  landlordName: listing.landlordName || existingListing?.landlordName || '',
  status: normalizeListingStatus(listing.status || existingListing?.status),
  price: Number.isFinite(Number(listing.price))
    ? Number(listing.price)
    : Number(existingListing?.price || 0),
  location:
    listing.location && listing.area
      ? formatListingLocation(listing)
      : listing.location || existingListing?.location || formatListingLocation(listing),
  propertyType: listing.propertyType || listing.roomType || existingListing?.propertyType || '',
  submittedDate:
    existingListing?.submittedDate ||
    listing.submittedDate ||
    listing.availableFrom ||
    new Date().toISOString().slice(0, 10),
  description: listing.description || existingListing?.description || '',
  amenities: listing.amenities || existingListing?.amenities || [],
  images: listing.images || existingListing?.images || [],
  rating: Number.isFinite(Number(listing.rating))
    ? Number(listing.rating)
    : Number(existingListing?.rating || 0),
  bookings: Number.isFinite(Number(listing.bookings))
    ? Number(listing.bookings)
    : Number(existingListing?.bookings || 0),
  views: Number.isFinite(Number(listing.views))
    ? Number(listing.views)
    : Number(existingListing?.views || 0),
})

const notifyAdminWorkspaceSync = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(ADMIN_WORKSPACE_SYNC_EVENT))
}

const persistWorkspace = (workspace) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(ADMIN_WORKSPACE_STORAGE_KEY, JSON.stringify(workspace))
}

export const loadAdminWorkspace = () => {
  if (typeof window === 'undefined') {
    return cloneSeed()
  }

  const stored = window.localStorage.getItem(ADMIN_WORKSPACE_STORAGE_KEY)

  if (!stored) {
    const seed = cloneSeed()
    window.localStorage.setItem(ADMIN_WORKSPACE_STORAGE_KEY, JSON.stringify(seed))
    return seed
  }

  try {
    return { ...cloneSeed(), ...JSON.parse(stored) }
  } catch {
    const seed = cloneSeed()
    window.localStorage.setItem(ADMIN_WORKSPACE_STORAGE_KEY, JSON.stringify(seed))
    return seed
  }
}

export const persistAdminWorkspace = (workspace) => {
  if (typeof window === 'undefined') {
    return
  }

  persistWorkspace(workspace)
}

export const upsertAdminWorkspaceLandlord = (landlord) => {
  if (typeof window === 'undefined' || !landlord) {
    return null
  }

  const workspace = loadAdminWorkspace()
  const lookupId = landlord.id || ''
  const lookupEmail = normalizeLookupValue(landlord.email)
  const nextLandlord = {
    ...landlord,
    status: landlord.status || 'Active',
  }

  const nextLandlords = workspace.landlords.some(
    (candidate) =>
      candidate.id === lookupId ||
      normalizeLookupValue(candidate.email) === lookupEmail,
  )
    ? workspace.landlords.map((candidate) =>
        candidate.id === lookupId || normalizeLookupValue(candidate.email) === lookupEmail
          ? { ...candidate, ...nextLandlord }
          : candidate,
      )
    : [nextLandlord, ...workspace.landlords]

  const nextWorkspace = {
    ...workspace,
    landlords: nextLandlords,
  }

  persistAdminWorkspace(nextWorkspace)
  notifyAdminWorkspaceSync()
  return nextWorkspace
}

export const upsertAdminWorkspaceListing = (listing) => {
  if (typeof window === 'undefined' || !listing) {
    return null
  }

  const workspace = loadAdminWorkspace()
  const lookupId = listing.id || ''
  const existingListing = workspace.listings.find((candidate) => candidate.id === lookupId)
  const nextListing = mapToWorkspaceListing(listing, existingListing)

  const nextListings = existingListing
    ? workspace.listings.map((candidate) =>
        candidate.id === lookupId ? nextListing : candidate,
      )
    : [nextListing, ...workspace.listings]

  const nextWorkspace = {
    ...workspace,
    listings: nextListings,
  }

  persistWorkspace(nextWorkspace)
  notifyAdminWorkspaceSync()
  return nextWorkspace
}

export const removeAdminWorkspaceListing = (listingId) => {
  if (typeof window === 'undefined' || !listingId) {
    return null
  }

  const workspace = loadAdminWorkspace()
  const nextWorkspace = {
    ...workspace,
    listings: workspace.listings.filter((candidate) => candidate.id !== listingId),
    bookings: workspace.bookings.filter((candidate) => candidate.listingId !== listingId),
  }

  persistWorkspace(nextWorkspace)
  notifyAdminWorkspaceSync()
  return nextWorkspace
}

export const resetAdminWorkspace = () => {
  const seed = cloneSeed()
  persistAdminWorkspace(seed)
  notifyAdminWorkspaceSync()
  return seed
}
