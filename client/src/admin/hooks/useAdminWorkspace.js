import { useMemo } from 'react'
import { formatCompactNumber, formatCurrency } from '../../utils/format'
import { useAdminWorkspaceContext } from '../context/AdminWorkspaceContext'

const toTimestamp = (value) => new Date(value || 0).valueOf()

const compareRecent = (first, second, key) => toTimestamp(second[key]) - toTimestamp(first[key])

const paginateRows = (items, page, pageSize) => {
  const startIndex = (page - 1) * pageSize
  return items.slice(startIndex, startIndex + pageSize)
}

export function useAdminWorkspace() {
  const context = useAdminWorkspaceContext()
  const { workspace } = context

  return useMemo(() => {
    const users = [...workspace.users].sort((first, second) => compareRecent(first, second, 'joinedDate'))
    const landlords = [...workspace.landlords].sort((first, second) =>
      compareRecent(first, second, 'joinedDate'),
    )
    const listings = [...workspace.listings].sort((first, second) =>
      compareRecent(first, second, 'submittedDate'),
    )
    const bookings = [...workspace.bookings].sort((first, second) =>
      compareRecent(first, second, 'checkIn'),
    )
    const conversations = [...workspace.conversations].sort(
      (first, second) =>
        toTimestamp(second.messages[second.messages.length - 1]?.createdAt) -
        toTimestamp(first.messages[first.messages.length - 1]?.createdAt),
    )

    const overviewCards = [
      {
        label: 'Users',
        value: formatCompactNumber(users.length + landlords.length),
        detail: 'All platform accounts',
        actionLabel: 'View all',
      },
      {
        label: 'Landlords',
        value: formatCompactNumber(landlords.length),
        detail: 'Verified and pending owners',
        actionLabel: 'View all',
      },
      {
        label: 'Listings',
        value: formatCompactNumber(listings.length),
        detail: 'Properties under management',
        actionLabel: 'View all',
      },
      {
        label: 'Bookings',
        value: formatCompactNumber(bookings.length),
        detail: 'Reservation records',
        actionLabel: 'View all',
      },
    ]

    const listingStatusCounts = listings.reduce(
      (counts, listing) => {
        const key = listing.status.toLowerCase()
        counts.all += 1
        counts[key] = (counts[key] || 0) + 1
        return counts
      },
      { all: 0, pending: 0, approved: 0, rejected: 0 },
    )

    const bookingStatusCounts = bookings.reduce(
      (counts, booking) => {
        const key = booking.status.toLowerCase()
        counts.all += 1
        counts[key] = (counts[key] || 0) + 1
        return counts
      },
      { all: 0, upcoming: 0, ongoing: 0, completed: 0, cancelled: 0 },
    )

    const totalRevenue = bookings
      .filter((booking) => booking.status !== 'Cancelled')
      .reduce((sum, booking) => sum + booking.amount, 0)

    const reportsSummary = {
      totalRevenue: formatCurrency(totalRevenue),
      totalBookings: formatCompactNumber(bookings.length),
      totalListings: formatCompactNumber(listings.length),
      newUsers: formatCompactNumber(users.length),
      listingBreakdown: [
        { label: 'Approved', value: listingStatusCounts.approved, color: '#16a34a' },
        { label: 'Pending', value: listingStatusCounts.pending, color: '#bbf7d0' },
        { label: 'Rejected', value: listingStatusCounts.rejected, color: '#e5e7eb' },
      ],
      revenueSeries: workspace.analytics.revenueSeries,
      dateRangeLabel: workspace.analytics.dateRangeLabel,
    }

    return {
      ...context,
      users,
      landlords,
      listings,
      bookings,
      conversations,
      overviewCards,
      recentListings: listings.slice(0, 4),
      recentActivity: [...workspace.activityFeed].sort((first, second) =>
        compareRecent(first, second, 'createdAt'),
      ),
      notifications: [...workspace.notifications].sort((first, second) =>
        compareRecent(first, second, 'createdAt'),
      ),
      listingStatusCounts,
      bookingStatusCounts,
      reportsSummary,
      paginateRows,
    }
  }, [context, workspace])
}
