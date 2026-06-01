import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import StatusBadge from '../../components/common/StatusBadge'
import AdminActionMenu from '../components/AdminActionMenu'
import AdminDataTable from '../components/AdminDataTable'
import AdminModal from '../components/AdminModal'
import AdminPageToolbar from '../components/AdminPageToolbar'
import AdminPagination from '../components/AdminPagination'
import AdminSectionTabs from '../components/AdminSectionTabs'
import { useAdminWorkspace } from '../hooks/useAdminWorkspace'
import { formatCurrency, formatDate } from '../../utils/format'

function AdminListingsPage() {
  const { listings, listingStatusCounts, paginateRows, updateListingStatus, deleteListing } =
    useAdminWorkspace()
  const [activeTab, setActiveTab] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(4)
  const [pendingDeletion, setPendingDeletion] = useState(null)

  const tabs = [
    { key: 'all', label: 'All Listings', count: listingStatusCounts.all },
    { key: 'pending', label: 'Pending', count: listingStatusCounts.pending },
    { key: 'approved', label: 'Approved', count: listingStatusCounts.approved },
    { key: 'rejected', label: 'Rejected', count: listingStatusCounts.rejected },
  ]

  const filteredListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return listings.filter((listing) => {
      const matchesTab = activeTab === 'all' || listing.status.toLowerCase() === activeTab
      const matchesQuery =
        !normalizedQuery ||
        `${listing.title} ${listing.landlordName} ${listing.location}`.toLowerCase().includes(normalizedQuery)
      return matchesTab && matchesQuery
    })
  }, [activeTab, listings, query])

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / pageSize))
  const paginatedListings = paginateRows(filteredListings, page, pageSize)

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
      render: (listing) => (
        <div className="flex items-center gap-3">
          <img alt={listing.title} className="h-12 w-12 rounded-xl object-cover" src={listing.images[0]} />
          <div>
            <p className="font-semibold text-ink">{listing.title}</p>
            <p className="text-sm text-slate-500">{listing.location}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'landlordName',
      label: 'Landlord',
      render: (listing) => <span className="text-sm text-slate-500">{listing.landlordName}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (listing) => <StatusBadge status={listing.status} />,
    },
    {
      key: 'price',
      label: 'Price',
      render: (listing) => <span className="font-semibold text-ink">{formatCurrency(listing.price)}</span>,
    },
    {
      key: 'submittedDate',
      label: 'Submitted On',
      render: (listing) => <span className="text-sm text-slate-500">{formatDate(listing.submittedDate)}</span>,
    },
    {
      key: 'actions',
      label: 'Action',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (listing) => (
        <div className="flex items-center justify-end gap-2">
          <Link className="text-sm font-semibold text-brand-600" to={`/admin/listings/${listing.id}`}>
            View Details
          </Link>
          <AdminActionMenu
            actions={[
              {
                label: 'Approve listing',
                onClick: () => updateListingStatus(listing.id, 'Approved'),
              },
              {
                label: 'Reject listing',
                onClick: () => updateListingStatus(listing.id, 'Rejected'),
              },
              {
                label: 'Delete listing',
                onClick: () => setPendingDeletion(listing),
                variant: 'danger',
              },
            ]}
          />
        </div>
      ),
    },
  ]

  return (
    <AppShell subtitle="Review and manage platform property listings." title="Listings">
      <section className="section-card">
        <AdminSectionTabs activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />
        <AdminPageToolbar
          onSearchChange={setQuery}
          searchPlaceholder="Search listings..."
          searchValue={query}
        />
        <AdminDataTable columns={columns} rows={paginatedListings} />
        <AdminPagination
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          page={page}
          pageSize={pageSize}
          totalItems={filteredListings.length}
          totalPages={totalPages}
        />
      </section>

      <AdminModal
        description={pendingDeletion ? `Delete ${pendingDeletion.title} from the admin workspace?` : ''}
        onPrimaryAction={() => {
          if (pendingDeletion) {
            deleteListing(pendingDeletion.id)
          }
          setPendingDeletion(null)
        }}
        onSecondaryAction={() => setPendingDeletion(null)}
        open={Boolean(pendingDeletion)}
        primaryActionClassName="action-button-secondary border-rose-200 text-rose-600 hover:bg-rose-50"
        primaryActionLabel="Delete listing"
        title="Delete listing"
      />
    </AppShell>
  )
}

export default AdminListingsPage
