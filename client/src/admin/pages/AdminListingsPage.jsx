import { useMemo, useState } from 'react'
import { BadgeCheck, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import ListingPreviewPanel from '../../components/common/ListingPreviewPanel'
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
  const [selectedListingId, setSelectedListingId] = useState('')
  const [pendingDeletion, setPendingDeletion] = useState(null)
  const [feedbackModal, setFeedbackModal] = useState({
    open: false,
    title: '',
    description: '',
    primaryActionLabel: 'Close',
    icon: null,
    iconClassName: '',
  })

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
  const safePage = Math.min(page, totalPages)
  const paginatedListings = paginateRows(filteredListings, safePage, pageSize)
  const previewListing =
    paginatedListings.find((listing) => listing.id === selectedListingId) || paginatedListings[0] || null

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

  const handleApprove = (listing) => {
    updateListingStatus(listing.id, 'Approved')
    openFeedbackModal(
      'Room approved',
      `${listing.title} has been approved and is now available in Search Rooms.`,
      'Close',
      <BadgeCheck size={24} />,
      'bg-emerald-50 text-emerald-600',
    )
  }

  const handleReject = (listing) => {
    updateListingStatus(listing.id, 'Rejected')
    openFeedbackModal(
      'Room rejected',
      `${listing.title} has been rejected and will not appear in Search Rooms.`,
      'Close',
      <XCircle size={24} />,
      'bg-rose-50 text-rose-600',
    )
  }

  const handleTabChange = (nextTab) => {
    setActiveTab(nextTab)
    setPage(1)
  }

  const handleSearchChange = (value) => {
    setQuery(value)
    setPage(1)
  }

  const handlePageSizeChange = (nextPageSize) => {
    setPageSize(nextPageSize)
    setPage(1)
  }

  const columns = [
    {
      key: 'property',
      label: 'Property',
      render: (listing) => (
        <div className="flex items-center gap-3">
          <button
            aria-label={`Preview ${listing.title}`}
            className={`overflow-hidden rounded-xl border transition ${
              previewListing?.id === listing.id
                ? 'border-brand-400 ring-2 ring-brand-100'
                : 'border-slate-100 hover:border-brand-200'
            }`}
            onClick={() => setSelectedListingId(listing.id)}
            type="button"
          >
            <img alt={listing.title} className="h-12 w-12 object-cover" src={listing.images[0]} />
          </button>
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
                onClick: () => handleApprove(listing),
              },
              {
                label: 'Reject listing',
                onClick: () => handleReject(listing),
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
    <AppShell
      subtitle="Review submitted rooms, approve them into Search Rooms, or reject them if they need changes."
      title="Listings"
    >
      <section className="section-card">
        <AdminSectionTabs activeTab={activeTab} onChange={handleTabChange} tabs={tabs} />
        <AdminPageToolbar
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search listings..."
          searchValue={query}
        />
        <div className="mb-5">
          <ListingPreviewPanel
            badge={previewListing ? <StatusBadge status={previewListing.status} /> : null}
            helperText="Click a thumbnail in the table to preview it above."
            image={previewListing?.images?.[0]}
            imageAlt={previewListing?.title}
            subtitle={
              previewListing
                ? `${previewListing.landlordName} • ${previewListing.location}`
                : 'No listings available to preview.'
            }
            title={previewListing?.title}
          >
            {previewListing ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Price
                  </p>
                  <p className="mt-1 font-semibold text-ink">{formatCurrency(previewListing.price)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Landlord
                  </p>
                  <p className="mt-1 font-semibold text-ink">{previewListing.landlordName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Submitted
                  </p>
                  <p className="mt-1 font-semibold text-ink">{formatDate(previewListing.submittedDate)}</p>
                </div>
              </div>
            ) : null}
          </ListingPreviewPanel>
        </div>
        <AdminDataTable columns={columns} rows={paginatedListings} />
        <AdminPagination
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          page={safePage}
          pageSize={pageSize}
          totalItems={filteredListings.length}
          totalPages={totalPages}
        />
      </section>

      <AdminModal
        description={pendingDeletion ? `Delete ${pendingDeletion.title} from the admin workspace?` : ''}
        onPrimaryAction={() => {
          if (pendingDeletion) {
            const deletedListing = pendingDeletion
            deleteListing(pendingDeletion.id)
            openFeedbackModal(
              'Room deleted',
              `${deletedListing.title} has been deleted from the admin workspace.`,
            )
          }
          setPendingDeletion(null)
        }}
        onSecondaryAction={() => setPendingDeletion(null)}
        open={Boolean(pendingDeletion)}
        primaryActionClassName="action-button-secondary border-rose-200 text-rose-600 hover:bg-rose-50"
        primaryActionLabel="Delete listing"
        title="Delete listing"
      />

      <AdminModal
        description={feedbackModal.description}
        icon={feedbackModal.icon}
        iconClassName={feedbackModal.iconClassName}
        onPrimaryAction={closeFeedbackModal}
        onSecondaryAction={closeFeedbackModal}
        open={feedbackModal.open}
        primaryActionLabel={feedbackModal.primaryActionLabel}
        title={feedbackModal.title}
      />
    </AppShell>
  )
}

export default AdminListingsPage
