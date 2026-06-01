import { BadgeCheck, Eye, FileText, Phone, ShieldCheck, X, XCircle } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import StatusBadge from '../../components/common/StatusBadge'
import AdminActionMenu from '../components/AdminActionMenu'
import AdminDataTable from '../components/AdminDataTable'
import AdminModal from '../components/AdminModal'
import AdminPageToolbar from '../components/AdminPageToolbar'
import AdminPagination from '../components/AdminPagination'
import AdminSectionTabs from '../components/AdminSectionTabs'
import { useAdminWorkspace } from '../hooks/useAdminWorkspace'
import { formatDate, formatDateTime, formatFileSize } from '../../utils/format'
import { useAppData } from '../../context/AppDataContext'
import {
  getLandlordVerificationDocuments,
  getLandlordVerificationLabel,
  getLandlordVerificationStatus,
} from '../../utils/landlordVerification'
import { resolveAllowedRoles } from '../../utils/roles'

const verificationSortOrder = {
  pending: 0,
  approved: 1,
  rejected: 2,
}

const reviewButtonClassName =
  'inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-semibold transition'

const documentMetaLabel = (document) => {
  const fileKind = document.mimeType?.toLowerCase().includes('pdf') ? 'PDF' : 'Image'
  const fileSize = formatFileSize(document.size)

  return [fileKind, fileSize].filter(Boolean).join(' - ')
}

const reviewSummaryCopy = {
  pending: {
    icon: ShieldCheck,
    title: 'Pending review',
    detail: 'Approve this request to unlock the landlord dashboard for this account.',
    className: 'bg-amber-50 text-amber-700',
  },
  approved: {
    icon: BadgeCheck,
    title: 'Approved',
    detail: 'This landlord can access listings, bookings, messages, and earnings.',
    className: 'bg-emerald-50 text-emerald-700',
  },
  rejected: {
    icon: XCircle,
    title: 'Rejected',
    detail: 'The landlord must update their files and resubmit before dashboard access is restored.',
    className: 'bg-rose-50 text-rose-700',
  },
}

const matchLandlordQuery = (candidate, normalizedQuery) =>
  !normalizedQuery ||
  `${candidate.name} ${candidate.email} ${candidate.properties} ${candidate.phone || ''}`
    .toLowerCase()
    .includes(normalizedQuery)

function AdminLandlordsPage() {
  const { landlords, paginateRows, removeLandlord, toggleLandlordStatus } = useAdminWorkspace()
  const { platformUsers, rooms, reviewLandlordVerification } = useAppData()
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('pending')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const [directoryPage, setDirectoryPage] = useState(1)
  const [directoryPageSize, setDirectoryPageSize] = useState(4)
  const [pendingRemoval, setPendingRemoval] = useState(null)
  const [selectedRequestId, setSelectedRequestId] = useState(null)
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false)

  const verificationRequests = useMemo(
    () =>
      platformUsers
        .filter(
          (platformUser) =>
            resolveAllowedRoles(platformUser).includes('landlord') &&
            (platformUser.landlordVerification || platformUser.landlordVerificationStatus),
        )
        .map((platformUser) => {
          const verification = platformUser.landlordVerification || {}
          const status = getLandlordVerificationStatus(platformUser)
          const documents = getLandlordVerificationDocuments(verification)
          const submittedAt =
            platformUser.landlordVerificationSubmittedAt ||
            verification.submittedAt ||
            platformUser.createdAt ||
            ''

          return {
            id: platformUser.id,
            name: platformUser.name,
            email: platformUser.email,
            avatar: platformUser.avatar,
            phone: verification.phone || platformUser.phone || 'Not provided',
            status,
            statusLabel: getLandlordVerificationLabel(status),
            submittedAt,
            reviewedAt: platformUser.landlordVerificationReviewedAt || '',
            documents,
          }
        })
        .filter((request) => ['pending', 'approved', 'rejected'].includes(request.status))
        .sort((first, second) => {
          const statusDifference =
            verificationSortOrder[first.status] - verificationSortOrder[second.status]

          if (statusDifference !== 0) {
            return statusDifference
          }

          return new Date(second.submittedAt || 0).valueOf() - new Date(first.submittedAt || 0).valueOf()
        }),
    [platformUsers],
  )

  const normalizedQuery = query.trim().toLowerCase()

  const filteredRequests = useMemo(
    () =>
      verificationRequests.filter((request) => {
        const matchesStatus = request.status === activeTab
        const matchesQuery =
          !normalizedQuery ||
          `${request.name} ${request.email} ${request.phone}`.toLowerCase().includes(normalizedQuery)

        return matchesStatus && matchesQuery
      }),
    [activeTab, normalizedQuery, verificationRequests],
  )

  const approvedVerificationLandlords = useMemo(
    () =>
      platformUsers
        .filter(
          (platformUser) =>
            resolveAllowedRoles(platformUser).includes('landlord') &&
            getLandlordVerificationStatus(platformUser) === 'approved',
        )
        .map((platformUser) => {
          const landlordRooms = rooms.filter((room) => room.landlordId === platformUser.id)
          const joinedDate =
            platformUser.landlordVerificationReviewedAt ||
            platformUser.landlordVerificationSubmittedAt ||
            platformUser.createdAt ||
            new Date().toISOString()

          return {
            id: platformUser.id,
            name: platformUser.name,
            email: platformUser.email,
            properties: landlordRooms.length,
            joinedDate,
            status: 'Active',
            avatar: platformUser.avatar,
            phone: platformUser.phone || platformUser.landlordVerification?.phone || 'Not provided',
          }
        }),
    [platformUsers, rooms],
  )

  const landlordDirectory = useMemo(() => {
    const workspaceLookup = new Set(
      landlords.map((landlord) => landlord.email?.toLowerCase()).filter(Boolean),
    )

    return [
      ...landlords,
      ...approvedVerificationLandlords.filter((landlord) => {
        const email = landlord.email?.toLowerCase()
        return !workspaceLookup.has(email)
      }),
    ]
  }, [approvedVerificationLandlords, landlords])

  const filteredDirectoryLandlords = useMemo(
    () => landlordDirectory.filter((landlord) => matchLandlordQuery(landlord, normalizedQuery)),
    [landlordDirectory, normalizedQuery],
  )

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / pageSize))
  const paginatedRequests = paginateRows(filteredRequests, page, pageSize)
  const directoryTotalPages = Math.max(
    1,
    Math.ceil(filteredDirectoryLandlords.length / directoryPageSize),
  )
  const paginatedLandlords = paginateRows(filteredDirectoryLandlords, directoryPage, directoryPageSize)

  const tabs = useMemo(
    () => [
      {
        key: 'pending',
        label: 'Pending',
        count: verificationRequests.filter((request) => request.status === 'pending').length,
      },
      {
        key: 'approved',
        label: 'Approved',
        count: verificationRequests.filter((request) => request.status === 'approved').length,
      },
      {
        key: 'rejected',
        label: 'Rejected',
        count: verificationRequests.filter((request) => request.status === 'rejected').length,
      },
    ],
    [verificationRequests],
  )

  useEffect(() => {
    setPage(1)
    setDirectoryPage(1)
  }, [activeTab, normalizedQuery, pageSize, directoryPageSize])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  useEffect(() => {
    if (directoryPage > directoryTotalPages) {
      setDirectoryPage(directoryTotalPages)
    }
  }, [directoryPage, directoryTotalPages])

  useEffect(() => {
    if (!isDocumentViewerOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeDocumentViewer()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDocumentViewerOpen])

  const selectedRequest =
    verificationRequests.find((request) => request.id === selectedRequestId) || null
  const selectedRequestSummary =
    (selectedRequest && reviewSummaryCopy[selectedRequest.status]) || reviewSummaryCopy.pending

  const handleReview = async (userId, status) => {
    await reviewLandlordVerification(userId, status)
  }

  const openDocumentViewer = (requestId) => {
    setSelectedRequestId(requestId)
    setIsDocumentViewerOpen(true)
  }

  const closeDocumentViewer = () => {
    setIsDocumentViewerOpen(false)
    setSelectedRequestId(null)
  }

  const landlordColumns = [
    {
      key: 'name',
      label: 'Name',
      render: (landlord) => (
        <div className="flex items-center gap-3">
          <img alt={landlord.name} className="h-10 w-10 rounded-full object-cover" src={landlord.avatar} />
          <div>
            <p className="font-semibold text-ink">{landlord.name}</p>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Landlord</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (landlord) => <span className="text-sm text-slate-500">{landlord.email}</span>,
    },
    {
      key: 'properties',
      label: 'Properties',
      render: (landlord) => <span className="font-semibold text-ink">{landlord.properties}</span>,
    },
    {
      key: 'joinedDate',
      label: 'Joined Date',
      render: (landlord) => <span className="text-sm text-slate-500">{formatDate(landlord.joinedDate)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (landlord) => <StatusBadge status={landlord.status} />,
    },
    {
      key: 'actions',
      label: 'Action',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (landlord) => (
        <div className="flex justify-end">
          <AdminActionMenu
            actions={[
              {
                label: landlord.status === 'Active' ? 'Set inactive' : 'Set active',
                onClick: () => toggleLandlordStatus(landlord.id),
              },
              {
                label: 'Remove landlord',
                onClick: () => setPendingRemoval(landlord),
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
      subtitle="Review landlord verification requests and manage approved hosts from one admin workspace."
      title="Landlords"
    >
      <section className="section-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">Verification</p>
            <h2 className="mt-2 text-2xl font-extrabold text-ink">Landlord verification queue</h2>
            <p className="mt-1 text-sm text-slate-500">
              Admin approval is now required before landlords can access their dashboard.
            </p>
          </div>
          <div className="pill">
            {verificationRequests.length} submitted request{verificationRequests.length === 1 ? '' : 's'}
          </div>
        </div>

        <div className="mt-5">
          <AdminSectionTabs activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />
        </div>

        <AdminPageToolbar
          onSearchChange={setQuery}
          searchPlaceholder="Search by name, email, or phone..."
          searchValue={query}
        >
          <span className="pill">
            {filteredRequests.length} in {activeTab}
          </span>
        </AdminPageToolbar>

        {paginatedRequests.length ? (
          <>
            <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-[980px] w-full">
                  <thead className="border-b border-slate-100 bg-slate-50/70">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Landlord
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Documents
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Submitted On
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedRequests.map((request) => (
                      <tr
                        className={`cursor-pointer align-middle transition ${
                          request.id === selectedRequestId ? 'bg-brand-50/45' : 'hover:bg-slate-50/70'
                        }`}
                        key={request.id}
                        onClick={() => setSelectedRequestId(request.id)}
                      >
                        <td className="px-4 py-3 text-sm text-slate-600">
                          <div className="flex items-center gap-3">
                            <img
                              alt={request.name}
                              className="h-10 w-10 rounded-full object-cover"
                              src={request.avatar}
                            />
                            <div>
                              <p className="font-semibold text-ink">{request.name}</p>
                              <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                                Verification request
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">{request.email}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{request.phone}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          <div className="space-y-1">
                            <p className="font-semibold text-ink">
                              {request.documents.length} file{request.documents.length === 1 ? '' : 's'}
                            </p>
                            <button
                              className="text-xs font-semibold text-brand-600 transition hover:text-brand-700"
                              onClick={(event) => {
                                event.stopPropagation()
                                openDocumentViewer(request.id)
                              }}
                              type="button"
                            >
                              View
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          {request.submittedAt ? formatDateTime(request.submittedAt) : 'Not provided'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500">
                          <StatusBadge status={request.statusLabel} />
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-500">
                          <div className="flex justify-end gap-2">
                            {request.status === 'pending' ? (
                              <>
                                <button
                                  className={`${reviewButtonClassName} border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    handleReview(request.id, 'approved')
                                  }}
                                  type="button"
                                >
                                  Approve
                                </button>
                                <button
                                  className={`${reviewButtonClassName} border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100`}
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    handleReview(request.id, 'rejected')
                                  }}
                                  type="button"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button
                                className={`${reviewButtonClassName} border border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:text-brand-700`}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  openDocumentViewer(request.id)
                                }}
                                type="button"
                              >
                                View
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <AdminPagination
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
              page={page}
              pageSize={pageSize}
              totalItems={filteredRequests.length}
              totalPages={totalPages}
            />
          </>
        ) : (
          <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
            <p className="text-lg font-bold text-ink">No verification requests found</p>
            <p className="mt-2 text-sm text-slate-500">
              Landlords will appear here after they submit their verification documents.
            </p>
          </div>
        )}
      </section>

      <section className="section-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-ink">Landlord directory</h2>
            <p className="mt-1 text-sm text-slate-500">
              Existing landlord management tools stay available below.
            </p>
          </div>
          <span className="pill">{filteredDirectoryLandlords.length} landlord records</span>
        </div>

        <div className="mt-5">
          <AdminDataTable columns={landlordColumns} rows={paginatedLandlords} />
        </div>

        <AdminPagination
          onPageChange={setDirectoryPage}
          onPageSizeChange={setDirectoryPageSize}
          page={directoryPage}
          pageSize={directoryPageSize}
          totalItems={filteredDirectoryLandlords.length}
          totalPages={directoryTotalPages}
        />
      </section>

      {isDocumentViewerOpen && selectedRequest ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/35 px-3 py-3 sm:items-center sm:px-4 sm:py-6"
          onClick={closeDocumentViewer}
        >
          <div
            className="panel flex w-full max-w-4xl max-h-[calc(100dvh-1rem)] flex-col overflow-hidden p-0 shadow-2xl sm:max-h-[calc(100dvh-1.5rem)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-slate-100 p-3.5 sm:p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Verification documents</p>
                  <h3 className="mt-1.5 text-lg font-extrabold text-ink sm:text-xl">
                    {selectedRequest.name}
                  </h3>
                  <p className="mt-1 text-sm leading-5 text-slate-500 sm:leading-6">
                    Review every document the landlord uploaded before approving access.
                  </p>
                </div>
                <button
                  aria-label="Close document viewer"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 sm:h-10 sm:w-10"
                  onClick={closeDocumentViewer}
                  type="button"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="grid gap-3 p-3.5 sm:p-4 lg:grid-cols-[240px_minmax(0,1fr)]">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-[18px] border border-slate-100 p-3">
                    <img
                      alt={selectedRequest.name}
                      className="h-12 w-12 rounded-full object-cover"
                      src={selectedRequest.avatar}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{selectedRequest.name}</p>
                      <p className="truncate text-sm text-slate-500">{selectedRequest.email}</p>
                      <div className="mt-1.5 inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <Phone size={14} />
                        <span>{selectedRequest.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-[18px] p-3.5 ${selectedRequestSummary.className}`}>
                    <div className="flex items-start gap-3">
                      <selectedRequestSummary.icon className="mt-0.5 shrink-0" size={18} />
                      <div>
                        <p className="font-semibold">{selectedRequestSummary.title}</p>
                        <p className="mt-1 text-sm leading-5">{selectedRequestSummary.detail}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-[18px] border border-slate-100 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Submitted
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-ink">
                        {selectedRequest.submittedAt
                          ? formatDateTime(selectedRequest.submittedAt)
                          : 'Not provided'}
                      </p>
                    </div>
                    <div className="rounded-[18px] border border-slate-100 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Reviewed
                      </p>
                      <p className="mt-1.5 text-sm font-semibold text-ink">
                        {selectedRequest.reviewedAt
                          ? formatDateTime(selectedRequest.reviewedAt)
                          : 'Awaiting review'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        Documents ({selectedRequest.documents.length})
                      </p>
                      <p className="mt-1 text-xs text-slate-400">All uploaded landlord files</p>
                    </div>
                    <StatusBadge status={selectedRequest.statusLabel} />
                  </div>

                  {selectedRequest.documents.length ? (
                    <div className="mt-3 grid gap-3 xl:grid-cols-2">
                      {selectedRequest.documents.map((document) => {
                        const hasPreview = Boolean(document.url)
                        const isImage =
                          hasPreview && /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(document.url)

                        return (
                          <div
                            className="rounded-[18px] border border-slate-100 bg-white p-3.5"
                            key={document.key}
                          >
                            <div className="flex items-start gap-3">
                              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-50 text-slate-500">
                                <FileText size={16} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-ink">{document.label}</p>
                                <p className="mt-1 truncate text-sm text-slate-500">{document.name}</p>
                                <p className="mt-1 text-xs text-slate-400">
                                  {documentMetaLabel(document) || 'Stored document'}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 overflow-hidden rounded-[16px] border border-slate-100 bg-slate-50/60">
                              {hasPreview && isImage ? (
                                <img
                                  alt={document.name}
                                  className="h-32 w-full object-cover sm:h-36"
                                  src={document.url}
                                />
                              ) : hasPreview ? (
                                <div className="flex h-32 items-center justify-center px-4 text-center text-sm text-slate-500 sm:h-36">
                                  Preview not available for this file type.
                                </div>
                              ) : (
                                <div className="flex h-32 items-center justify-center px-4 text-center text-sm text-slate-500 sm:h-36">
                                  This document is stored without a public preview.
                                </div>
                              )}
                            </div>

                            <div className="mt-2.5 flex items-center justify-between gap-3">
                              <p className="text-xs text-slate-400">
                                {document.url ? 'Open the uploaded file in a new tab.' : 'Saved in the record.'}
                              </p>
                              {document.url ? (
                                <a
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-200 hover:text-brand-700"
                                  href={document.url}
                                  onClick={(event) => event.stopPropagation()}
                                  rel="noreferrer"
                                  target="_blank"
                                >
                                  <Eye size={14} />
                                  View
                                </a>
                              ) : null}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="mt-3 rounded-[18px] border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-500">
                      No documents were attached to this request yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 p-3.5 sm:p-4">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  className="action-button-secondary w-full justify-center sm:w-auto"
                  onClick={closeDocumentViewer}
                  type="button"
                >
                  Close
                </button>
                {selectedRequest.status === 'pending' ? (
                  <>
                    <button
                      className="action-button-primary w-full justify-center bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto"
                      onClick={() => {
                        handleReview(selectedRequest.id, 'approved')
                        closeDocumentViewer()
                      }}
                      type="button"
                    >
                      Approve landlord
                    </button>
                    <button
                      className="action-button-secondary w-full justify-center border-rose-200 text-rose-600 hover:bg-rose-50 sm:w-auto"
                      onClick={() => {
                        handleReview(selectedRequest.id, 'rejected')
                        closeDocumentViewer()
                      }}
                      type="button"
                    >
                      Reject landlord
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <AdminModal
        description={
          pendingRemoval
            ? `This will remove ${pendingRemoval.name} and hide their properties from this admin workspace.`
            : ''
        }
        onPrimaryAction={() => {
          if (pendingRemoval) {
            removeLandlord(pendingRemoval.id)
          }
          setPendingRemoval(null)
        }}
        onSecondaryAction={() => setPendingRemoval(null)}
        open={Boolean(pendingRemoval)}
        primaryActionClassName="action-button-secondary border-rose-200 text-rose-600 hover:bg-rose-50"
        primaryActionLabel="Remove landlord"
        title="Remove landlord"
      />
    </AppShell>
  )
}

export default AdminLandlordsPage
