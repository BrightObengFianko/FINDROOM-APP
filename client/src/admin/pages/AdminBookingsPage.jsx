import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import StatusBadge from '../../components/common/StatusBadge'
import { formatCurrency, formatDate } from '../../utils/format'
import AdminActionMenu from '../components/AdminActionMenu'
import AdminDataTable from '../components/AdminDataTable'
import AdminPageToolbar from '../components/AdminPageToolbar'
import AdminPagination from '../components/AdminPagination'
import AdminSectionTabs from '../components/AdminSectionTabs'
import { useAdminWorkspace } from '../hooks/useAdminWorkspace'

function AdminBookingsPage() {
  const { bookings, bookingStatusCounts, listings, paginateRows, updateBookingStatus } =
    useAdminWorkspace()
  const [activeTab, setActiveTab] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(4)

  const listingMap = useMemo(
    () => Object.fromEntries(listings.map((listing) => [listing.id, listing])),
    [listings],
  )

  const tabs = [
    { key: 'all', label: 'All', count: bookingStatusCounts.all },
    { key: 'upcoming', label: 'Upcoming', count: bookingStatusCounts.upcoming },
    { key: 'ongoing', label: 'Ongoing', count: bookingStatusCounts.ongoing },
    { key: 'completed', label: 'Completed', count: bookingStatusCounts.completed },
    { key: 'cancelled', label: 'Cancelled', count: bookingStatusCounts.cancelled },
  ]

  const filteredBookings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return bookings.filter((booking) => {
      const listing = listingMap[booking.listingId]
      const matchesTab = activeTab === 'all' || booking.status.toLowerCase() === activeTab
      const matchesQuery =
        !normalizedQuery ||
        `${booking.property} ${booking.userName} ${booking.landlordName} ${listing?.location || ''}`
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesTab && matchesQuery
    })
  }, [activeTab, bookings, listingMap, query])

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize))
  const paginatedBookings = paginateRows(filteredBookings, page, pageSize)

  useEffect(() => {
    setPage(1)
  }, [activeTab, query, pageSize])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const columns = [
    {
      key: 'property',
      label: 'Property',
      render: (booking) => {
        const listing = listingMap[booking.listingId]

        return (
          <div className="flex items-center gap-3">
            <img
              alt={booking.property}
              className="h-12 w-12 rounded-xl object-cover"
              src={listing?.images?.[0] || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80'}
            />
            <div className="min-w-0">
              <Link className="block truncate font-semibold text-ink" to={`/admin/listings/${booking.listingId}`}>
                {booking.property}
              </Link>
              <p className="mt-1 text-sm text-slate-500">{listing?.location || 'Location unavailable'}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'guest',
      label: 'Guest',
      render: (booking) => (
        <div>
          <p className="font-semibold text-ink">{booking.userName}</p>
          <p className="mt-1 text-sm text-slate-500">{booking.landlordName}</p>
        </div>
      ),
    },
    {
      key: 'dates',
      label: 'Dates',
      render: (booking) => (
        <div className="space-y-1 text-sm text-slate-500">
          <p>Check in: {formatDate(booking.checkIn)}</p>
          <p>Check out: {formatDate(booking.checkOut)}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (booking) => <span className="font-semibold text-ink">{formatCurrency(booking.amount)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (booking) => <StatusBadge status={booking.status} />,
    },
    {
      key: 'actions',
      label: 'Action',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (booking) => (
        <div className="flex justify-end">
          <AdminActionMenu
            actions={[
              booking.status !== 'Upcoming'
                ? {
                    label: 'Mark upcoming',
                    onClick: () => updateBookingStatus(booking.id, 'Upcoming'),
                  }
                : null,
              booking.status !== 'Ongoing'
                ? {
                    label: 'Mark ongoing',
                    onClick: () => updateBookingStatus(booking.id, 'Ongoing'),
                  }
                : null,
              booking.status !== 'Completed'
                ? {
                    label: 'Mark completed',
                    onClick: () => updateBookingStatus(booking.id, 'Completed'),
                  }
                : null,
              booking.status !== 'Cancelled'
                ? {
                    label: 'Cancel booking',
                    onClick: () => updateBookingStatus(booking.id, 'Cancelled'),
                    variant: 'danger',
                  }
                : null,
            ].filter(Boolean)}
          />
        </div>
      ),
    },
  ]

  return (
    <AppShell subtitle="Review bookings, update statuses, and monitor reservation activity." title="Bookings">
      <section className="section-card">
        <AdminSectionTabs activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />
        <AdminPageToolbar
          onSearchChange={setQuery}
          searchPlaceholder="Search bookings..."
          searchValue={query}
        />
        <AdminDataTable columns={columns} rows={paginatedBookings} />
        <AdminPagination
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          page={page}
          pageSize={pageSize}
          totalItems={filteredBookings.length}
          totalPages={totalPages}
        />
      </section>
    </AppShell>
  )
}

export default AdminBookingsPage
