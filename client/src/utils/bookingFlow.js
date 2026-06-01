const BOOKING_DRAFTS_STORAGE_KEY = 'findroom-booking-drafts'
const BOOKING_RECEIPTS_STORAGE_KEY = 'findroom-booking-receipts'
const LAST_BOOKING_RECEIPT_KEY = 'findroom-last-booking-receipt'

const readSessionJson = (key, fallback) => {
  if (typeof window === 'undefined') {
    return fallback
  }

  const storedValue = window.sessionStorage.getItem(key)

  if (!storedValue) {
    return fallback
  }

  try {
    return JSON.parse(storedValue)
  } catch {
    return fallback
  }
}

const writeSessionJson = (key, value) => {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(key, JSON.stringify(value))
}

const normalizeRoomKey = (roomId) => String(roomId || '').trim()

export const normalizeDurationMonths = (value) => {
  const durationMonths = Number.parseInt(value, 10)
  return Number.isFinite(durationMonths) && durationMonths > 0 ? durationMonths : 1
}

export const formatDurationLabel = (value) => {
  const durationMonths = normalizeDurationMonths(value)
  return `${durationMonths} month${durationMonths === 1 ? '' : 's'}`
}

export const readBookingDraft = (roomId) => {
  const roomKey = normalizeRoomKey(roomId)

  if (!roomKey) {
    return null
  }

  const drafts = readSessionJson(BOOKING_DRAFTS_STORAGE_KEY, {})
  return drafts[roomKey] || null
}

export const writeBookingDraft = (roomId, draft) => {
  const roomKey = normalizeRoomKey(roomId)

  if (!roomKey) {
    return
  }

  const drafts = readSessionJson(BOOKING_DRAFTS_STORAGE_KEY, {})
  drafts[roomKey] = draft
  writeSessionJson(BOOKING_DRAFTS_STORAGE_KEY, drafts)
}

export const clearBookingDraft = (roomId) => {
  const roomKey = normalizeRoomKey(roomId)

  if (!roomKey) {
    return
  }

  const drafts = readSessionJson(BOOKING_DRAFTS_STORAGE_KEY, {})
  delete drafts[roomKey]
  writeSessionJson(BOOKING_DRAFTS_STORAGE_KEY, drafts)
}

export const getBookingReference = (bookingId) => {
  const numericPart = String(bookingId || '')
    .replace(/\D/g, '')
    .slice(-6)
    .padStart(6, '0')

  return `FR${numericPart || '000000'}`
}

export const readBookingReceipt = (bookingId) => {
  const receipts = readSessionJson(BOOKING_RECEIPTS_STORAGE_KEY, {})
  const resolvedBookingId =
    bookingId ||
    (typeof window !== 'undefined'
      ? window.sessionStorage.getItem(LAST_BOOKING_RECEIPT_KEY)
      : '')

  if (!resolvedBookingId) {
    return null
  }

  return receipts[resolvedBookingId] || null
}

export const writeBookingReceipt = (receipt) => {
  if (!receipt?.bookingId) {
    return
  }

  const receipts = readSessionJson(BOOKING_RECEIPTS_STORAGE_KEY, {})
  receipts[receipt.bookingId] = receipt
  writeSessionJson(BOOKING_RECEIPTS_STORAGE_KEY, receipts)

  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(LAST_BOOKING_RECEIPT_KEY, receipt.bookingId)
  }
}
