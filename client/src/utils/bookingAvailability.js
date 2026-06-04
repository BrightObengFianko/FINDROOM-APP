import { formatDate } from './format'

const parseDateLike = (value) => {
  if (!value) {
    return null
  }

  if (value instanceof Date) {
    return new Date(value.getTime())
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/)

    if (match) {
      const [, year, month, day] = match
      return new Date(Number(year), Number(month) - 1, Number(day), 12)
    }

    const parsed = new Date(trimmed)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`

const normalizeDateKey = (value) => {
  const parsed = parseDateLike(value)
  return parsed ? formatDateKey(parsed) : ''
}

export const normalizeDurationMonths = (value) => {
  const numericValue = Number.parseInt(String(value || '').match(/\d+/)?.[0] || '', 10)

  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 1
}

export const calculateBookingLockUntilDate = ({ startDate, durationMonths, duration }) => {
  const start = parseDateLike(startDate)

  if (!start) {
    return ''
  }

  const months = normalizeDurationMonths(durationMonths || duration)
  const checkoutDate = new Date(start.getTime())
  const originalDay = checkoutDate.getDate()

  checkoutDate.setMonth(checkoutDate.getMonth() + months, 1)

  const lastDayOfMonth = new Date(
    checkoutDate.getFullYear(),
    checkoutDate.getMonth() + 1,
    0,
  ).getDate()

  checkoutDate.setDate(Math.min(originalDay, lastDayOfMonth))
  return formatDateKey(checkoutDate)
}

export const isRoomBookingLocked = (room, currentDateKey = formatDateKey(new Date())) => {
  const lockUntil = normalizeDateKey(room?.bookingLockedUntil)

  return Boolean(lockUntil && lockUntil >= currentDateKey)
}

export const getRoomBookingLockLabel = (room) => {
  const lockUntil = normalizeDateKey(room?.bookingLockedUntil)

  return lockUntil ? `Booked until ${formatDate(lockUntil)}` : ''
}
