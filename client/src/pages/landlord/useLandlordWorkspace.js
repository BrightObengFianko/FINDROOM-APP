import { useMemo } from 'react'
import {
  bookings as fallbackBookingRows,
  earningsSummary as fallbackSummaryCards,
  landlordStats as fallbackOverviewStats,
  listings as fallbackListings,
  recentBookings as fallbackRecentBookings,
  transactions as fallbackTransactions,
} from '../../landlord-dashboard/data'
import { useAppData } from '../../context/AppDataContext'
import { useAuth } from '../../context/AuthContext'
import { formatCurrency, formatDate } from '../../utils/format'

const fallbackChartPoints = [18, 26, 38, 52, 68, 84]
const chartLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6']

const toTimestamp = (value) => new Date(value || 0).valueOf()

export const normalizeStatusKey = (status = '') => {
  const key = String(status).trim().toLowerCase()

  if (key === 'confirmed') {
    return 'approved'
  }

  if (key === 'active') {
    return 'approved'
  }

  if (key === 'inactive') {
    return 'cancelled'
  }

  return key
}

const formatRoomLocation = (room = {}) =>
  [...new Set([room.area, room.location].filter(Boolean))].join(', ') ||
  room.location ||
  'Location unavailable'

const buildChartPoints = (payments = []) => {
  const successfulPayments = [...payments]
    .filter((payment) => payment.status === 'successful')
    .sort((first, second) => toTimestamp(first.createdAt) - toTimestamp(second.createdAt))

  if (!successfulPayments.length) {
    return fallbackChartPoints
  }

  let runningTotal = 0
  const cumulativeTotals = successfulPayments.map((payment) => {
    runningTotal += payment.amount
    return runningTotal
  })

  if (cumulativeTotals.length >= fallbackChartPoints.length) {
    return cumulativeTotals.slice(-fallbackChartPoints.length)
  }

  const missingPoints = fallbackChartPoints.length - cumulativeTotals.length
  const firstPoint = cumulativeTotals[0]
  const seedValue = Math.max(Math.round(firstPoint * 0.3), 1)
  const seededPoints = Array.from({ length: missingPoints }, (_, index) =>
    Math.round((seedValue * (index + 1)) / (missingPoints + 1)),
  )

  return [...seededPoints, ...cumulativeTotals]
}

const formatBookingStatusLabel = (status = '') => {
  const normalizedStatus = normalizeStatusKey(status)

  if (normalizedStatus === 'approved') {
    return 'Confirmed'
  }

  if (!status) {
    return 'Pending'
  }

  return String(status).charAt(0).toUpperCase() + String(status).slice(1)
}

export function useLandlordWorkspace() {
  const { bookings, payments, rooms, threads, userMap } = useAppData()
  const { user } = useAuth()

  return useMemo(() => {
    const ownedRooms = user?.id ? rooms.filter((room) => room.landlordId === user.id) : []
    const hasLiveData = Boolean(
      ownedRooms.length || bookings.length || payments.length || threads.length,
    )

    if (!hasLiveData) {
      return {
        usesFallback: true,
        chartLabels,
        chartPoints: fallbackChartPoints,
        overviewStats: fallbackOverviewStats.map((item) => ({
          label: item.label,
          value: item.value,
          detail: item.hint,
        })),
        recentBookings: fallbackRecentBookings,
        listings: fallbackListings,
        bookingRows: fallbackBookingRows.map((item) => {
          const listingMatch = fallbackListings.find((listing) => listing.title === item.property)

          return {
            ...item,
            location: listingMatch?.location || 'Location unavailable',
            monthlyPrice: listingMatch
              ? `${listingMatch.price} ${listingMatch.unit}`
              : item.amount,
            totalAmount: item.amount,
            statusLabel: formatBookingStatusLabel(item.status),
            sortDate: toTimestamp(item.dates?.[0]),
            searchText: `${item.property} ${item.guest} ${item.status} ${listingMatch?.location || ''}`.toLowerCase(),
            statusKey: normalizeStatusKey(item.status),
          }
        }),
        summaryCards: fallbackSummaryCards.map((item) => ({
          label: item.label,
          value: item.value,
          detail: item.hint || item.link || 'Updated this month',
        })),
        transactionRows: fallbackTransactions.map((item) => ({
          ...item,
          sortDate: toTimestamp(item.date),
          statusKey: normalizeStatusKey(item.status),
        })),
      }
    }

    const roomById = new Map(ownedRooms.map((room) => [room.id, room]))
    const bookingById = new Map(bookings.map((booking) => [booking.id, booking]))
    const successfulPayments = payments.filter((payment) => payment.status === 'successful')
    const pendingPayments = payments.filter((payment) => payment.status === 'pending')
    const totalEarnings = successfulPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const pendingEarnings = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0)
    const activeListings = ownedRooms.filter(
      (room) => normalizeStatusKey(room.status) === 'approved',
    ).length
    const upcomingBookings = bookings.filter((booking) =>
      ['approved', 'pending'].includes(normalizeStatusKey(booking.status)),
    ).length

    const overviewStats = [
      {
        label: 'Total Listings',
        value: ownedRooms.length,
        detail: `${activeListings} active right now`,
      },
      {
        label: 'Upcoming Bookings',
        value: upcomingBookings,
        detail: 'Requests and confirmed stays',
      },
      {
        label: 'Unread Messages',
        value: threads.length,
        detail: 'Conversations in your inbox',
      },
      {
        label: 'Total Earnings',
        value: formatCurrency(totalEarnings),
        detail: 'Successful landlord payouts',
      },
    ]

    const recentBookings = [...bookings]
      .sort((first, second) => toTimestamp(second.startDate) - toTimestamp(first.startDate))
      .slice(0, 4)
      .map((booking, index) => {
        const room = roomById.get(booking.roomId)
        const guestName = userMap[booking.userId]?.name || `Guest ${index + 1}`

        return {
          id: booking.id,
          property: booking.roomTitle,
          guest: guestName,
          dates: `${formatDate(booking.startDate)} | ${booking.duration || 'Flexible stay'}`,
          amount: formatCurrency(booking.amount),
          status: booking.status,
          image: room?.images?.[0],
        }
      })

    const listings = ownedRooms
      .map((room) => {
        const roomBookings = bookings.filter((booking) => booking.roomId === room.id)
        const roomEarnings = payments.reduce((sum, payment) => {
          const booking = bookingById.get(payment.bookingId)
          if (!booking || booking.roomId !== room.id || payment.status !== 'successful') {
            return sum
          }

          return sum + payment.amount
        }, 0)

        return {
          id: room.id,
          title: room.title,
          location: formatRoomLocation(room),
          price: formatCurrency(room.price),
          unit: '/ month',
          bookings: roomBookings.length,
          views: room.rating ? `${room.rating.toFixed(1)} rating` : '--',
          earnings: formatCurrency(roomEarnings),
          status: room.status,
          image: room.images?.[0],
          roomType: room.roomType,
        }
      })
      .sort((first, second) => toTimestamp(second.availableFrom) - toTimestamp(first.availableFrom))

    const bookingRows = [...bookings]
      .sort((first, second) => toTimestamp(second.startDate) - toTimestamp(first.startDate))
      .map((booking, index) => {
        const room = roomById.get(booking.roomId)
        const guest = userMap[booking.userId] || {}
        const recurringPrice = room?.price || booking.amount
        const durationInMonths = Number.parseInt(booking.duration, 10)
        const totalAmount =
          Number.isFinite(durationInMonths) && durationInMonths > 1
            ? recurringPrice * durationInMonths
            : booking.amount

        return {
          id: booking.id,
          property: booking.roomTitle,
          guest: guest.name || `Guest ${index + 1}`,
          location: formatRoomLocation(room),
          monthlyPrice: `${formatCurrency(recurringPrice)} / month`,
          totalAmount: formatCurrency(totalAmount),
          email: guest.email || 'guest@findroom.app',
          phone: guest.phone || 'Phone not provided',
          dates: [formatDate(booking.startDate), booking.duration || 'Flexible stay'],
          amount: formatCurrency(booking.amount),
          status: booking.status,
          statusLabel: formatBookingStatusLabel(booking.status),
          image: room?.images?.[0],
          sortDate: toTimestamp(booking.startDate),
          searchText: `${booking.roomTitle} ${guest.name || ''} ${guest.email || ''} ${booking.status} ${formatRoomLocation(room)}`.toLowerCase(),
          statusKey: normalizeStatusKey(booking.status),
        }
      })

    const summaryCards = [
      {
        label: 'Total Earnings',
        value: formatCurrency(totalEarnings),
        detail: `${successfulPayments.length} successful payouts`,
      },
      {
        label: 'Pending Payouts',
        value: formatCurrency(pendingEarnings),
        detail: `${pendingPayments.length} waiting for release`,
      },
      {
        label: 'Average Booking',
        value: bookings.length
          ? formatCurrency(
              Math.round(bookings.reduce((sum, booking) => sum + booking.amount, 0) / bookings.length),
            )
          : formatCurrency(0),
        detail: 'Average booking value',
      },
    ]

    const transactionRows = [...payments]
      .sort((first, second) => toTimestamp(second.createdAt) - toTimestamp(first.createdAt))
      .map((payment) => {
        const booking = bookingById.get(payment.bookingId)
        return {
          id: payment.id,
          date: formatDate(payment.createdAt),
          property: booking?.roomTitle || 'Property payout',
          amount: formatCurrency(payment.amount),
          status: payment.status,
          sortDate: toTimestamp(payment.createdAt),
          statusKey: normalizeStatusKey(payment.status),
        }
      })

    return {
      usesFallback: false,
      chartLabels,
      chartPoints: buildChartPoints(payments),
      overviewStats,
      recentBookings,
      listings,
      bookingRows,
      summaryCards,
      transactionRows,
    }
  }, [bookings, payments, rooms, threads, user, userMap])
}
