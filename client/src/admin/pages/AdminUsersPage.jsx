import { useEffect, useMemo, useState } from 'react'
import AppShell from '../../components/layout/AppShell'
import StatusBadge from '../../components/common/StatusBadge'
import { useAppData } from '../../context/AppDataContext'
import { useAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/format'
import { resolveAllowedRoles } from '../../utils/roles'
import AdminActionMenu from '../components/AdminActionMenu'
import AdminDataTable from '../components/AdminDataTable'
import AdminModal from '../components/AdminModal'
import AdminPageToolbar from '../components/AdminPageToolbar'
import AdminPagination from '../components/AdminPagination'
import AdminSectionTabs from '../components/AdminSectionTabs'
import { useAdminWorkspace } from '../hooks/useAdminWorkspace'

const toTitleCase = (value = '') =>
  String(value).charAt(0).toUpperCase() + String(value).slice(1)

const formatRoleLabel = (roles = []) => roles.map((role) => toTitleCase(role)).join(' / ')

const derivePlatformJoinedDate = (user) => {
  if (user?.joinedDate) {
    return user.joinedDate
  }

  if (user?.createdAt) {
    return user.createdAt
  }

  const timestampMatch = String(user?.id || '').match(/(\d{12,})$/)
  const timestamp = Number(timestampMatch?.[1])

  if (Number.isFinite(timestamp) && timestamp > 0) {
    return new Date(timestamp).toISOString()
  }

  return new Date().toISOString()
}

function AdminUsersPage() {
  const {
    users: workspaceUsers,
    paginateRows,
    removeUser,
    toggleUserStatus,
    promoteUserToAdmin,
    revokeUserAdminAccess,
  } = useAdminWorkspace()
  const {
    platformUsers,
    grantPlatformUserAdminAccess,
    revokePlatformUserAdminAccess,
    removePlatformUser,
    togglePlatformUserStatus,
  } = useAppData()
  const { user: currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(4)
  const [selectedUser, setSelectedUser] = useState(null)
  const [pendingRemoval, setPendingRemoval] = useState(null)

  const mergedUsers = useMemo(() => {
    const platformRows = platformUsers
      .filter((platformUser) => {
        const allowedRoles = resolveAllowedRoles(platformUser)
        return allowedRoles.includes('user') || allowedRoles.includes('admin')
      })
      .map((platformUser) => {
        const allowedRoles = resolveAllowedRoles(platformUser)

        return {
          id: platformUser.id,
          name: platformUser.name || 'Unnamed user',
          email: platformUser.email || 'No email provided',
          role: formatRoleLabel(allowedRoles),
          joinedDate: derivePlatformJoinedDate(platformUser),
          status: platformUser.status === 'Inactive' ? 'Inactive' : 'Active',
          phone: platformUser.phone || 'Not provided',
          avatar:
            platformUser.avatar ||
            `https://i.pravatar.cc/120?u=${encodeURIComponent(platformUser.email || platformUser.id)}`,
          source: 'platform',
          hasAdminAccess: allowedRoles.includes('admin'),
        }
      })

    if (currentUser) {
      const alreadyIncluded = platformRows.some(
        (candidate) =>
          candidate.id === currentUser.id ||
          candidate.email?.toLowerCase() === currentUser.email?.toLowerCase(),
      )

      if (!alreadyIncluded) {
        const allowedRoles = resolveAllowedRoles(currentUser)

        platformRows.unshift({
          id: currentUser.id,
          name: currentUser.name || 'Current user',
          email: currentUser.email || 'No email provided',
          role: formatRoleLabel(allowedRoles),
          joinedDate: derivePlatformJoinedDate(currentUser),
          status: currentUser.status === 'Inactive' ? 'Inactive' : 'Active',
          phone: currentUser.phone || 'Not provided',
          avatar:
            currentUser.avatar ||
            `https://i.pravatar.cc/120?u=${encodeURIComponent(currentUser.email || currentUser.id)}`,
          source: 'session',
          hasAdminAccess: allowedRoles.includes('admin'),
        })
      }
    }

    const platformEmails = new Set(
      platformRows.map((user) => user.email?.toLowerCase()).filter(Boolean),
    )

    const workspaceRows = workspaceUsers
      .filter((workspaceUser) => !platformEmails.has(workspaceUser.email?.toLowerCase()))
      .map((workspaceUser) => ({
        ...workspaceUser,
        source: 'workspace',
        hasAdminAccess: String(workspaceUser.role).toLowerCase() === 'admin',
      }))

    return [...platformRows, ...workspaceRows].sort(
      (first, second) =>
        new Date(second.joinedDate || 0).valueOf() - new Date(first.joinedDate || 0).valueOf(),
    )
  }, [currentUser, platformUsers, workspaceUsers])

  const tabs = [
    { key: 'all', label: 'All', count: mergedUsers.length },
    {
      key: 'active',
      label: 'Active',
      count: mergedUsers.filter((user) => user.status === 'Active').length,
    },
    {
      key: 'inactive',
      label: 'Inactive',
      count: mergedUsers.filter((user) => user.status === 'Inactive').length,
    },
  ]

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return mergedUsers.filter((user) => {
      const matchesTab = activeTab === 'all' || user.status.toLowerCase() === activeTab
      const matchesQuery =
        !normalizedQuery ||
        `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(normalizedQuery)

      return matchesTab && matchesQuery
    })
  }, [activeTab, mergedUsers, query])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const paginatedUsers = paginateRows(filteredUsers, page, pageSize)

  useEffect(() => {
    setPage(1)
  }, [activeTab, query, pageSize])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const handlePromoteToAdmin = (user) => {
    if (user.source === 'platform') {
      grantPlatformUserAdminAccess(user.id)
      return
    }

    promoteUserToAdmin(user.id)
  }

  const handleToggleStatus = (user) => {
    if (user.source === 'platform') {
      togglePlatformUserStatus(user.id)
      return
    }

    toggleUserStatus(user.id)
  }

  const handleRemoveUser = (user) => {
    if (user.source === 'platform') {
      removePlatformUser(user.id)
      return
    }

    removeUser(user.id)
  }

  const handleRevokeAdminAccess = (user) => {
    if (user.source === 'platform') {
      revokePlatformUserAdminAccess(user.id)
      return
    }

    revokeUserAdminAccess(user.id)
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (user) => (
        <div className="flex items-center gap-3">
          <img alt={user.name} className="h-10 w-10 rounded-full object-cover" src={user.avatar} />
          <div>
            <p className="font-semibold text-ink">{user.name}</p>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400">{user.role}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (user) => <span className="text-sm text-slate-500">{user.email}</span>,
    },
    {
      key: 'joinedDate',
      label: 'Joined Date',
      render: (user) => <span className="text-sm text-slate-500">{formatDate(user.joinedDate)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (user) => <StatusBadge status={user.status} />,
    },
    {
      key: 'actions',
      label: 'Action',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (user) => (
        <div className="flex justify-end">
          <AdminActionMenu
            actions={[
              { label: 'View profile', onClick: () => setSelectedUser(user) },
              user.source === 'session'
                ? null
                : !user.hasAdminAccess
                ? {
                    label: 'Make admin',
                    onClick: () => handlePromoteToAdmin(user),
                  }
                : user.id !== currentUser?.id
                  ? {
                      label: 'Undo admin',
                      onClick: () => handleRevokeAdminAccess(user),
                    }
                : null,
              {
                label: user.status === 'Active' ? 'Set inactive' : 'Set active',
                onClick: () => handleToggleStatus(user),
              },
              {
                label: 'Remove user',
                onClick: () => setPendingRemoval(user),
                variant: 'danger',
              },
            ].filter(Boolean)}
          />
        </div>
      ),
    },
  ]

  return (
    <AppShell subtitle="Manage platform users and control who can access the admin workspace." title="Users">
      <section className="section-card">
        <AdminSectionTabs activeTab={activeTab} onChange={setActiveTab} tabs={tabs} />
        <AdminPageToolbar
          onSearchChange={setQuery}
          searchPlaceholder="Search users..."
          searchValue={query}
        />
        <AdminDataTable columns={columns} rows={paginatedUsers} />
        <AdminPagination
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          page={page}
          pageSize={pageSize}
          totalItems={filteredUsers.length}
          totalPages={totalPages}
        />
      </section>

      <AdminModal
        description={selectedUser ? `${selectedUser.email} - ${selectedUser.phone}` : ''}
        onPrimaryAction={() => setSelectedUser(null)}
        onSecondaryAction={() => setSelectedUser(null)}
        open={Boolean(selectedUser)}
        primaryActionLabel="Done"
        secondaryActionLabel="Close"
        title={selectedUser?.name || 'User details'}
      >
        {selectedUser ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[18px] bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Status</p>
              <div className="mt-2">
                <StatusBadge status={selectedUser.status} />
              </div>
            </div>
            <div className="rounded-[18px] bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Joined</p>
              <p className="mt-2 text-sm font-semibold text-ink">{formatDate(selectedUser.joinedDate)}</p>
            </div>
            <div className="rounded-[18px] bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Roles</p>
              <p className="mt-2 text-sm font-semibold text-ink">{selectedUser.role}</p>
            </div>
          </div>
        ) : null}
      </AdminModal>

      <AdminModal
        description={
          pendingRemoval
            ? pendingRemoval.source === 'platform'
              ? `This will remove ${pendingRemoval.name} from the platform login records.`
              : `This will remove ${pendingRemoval.name} from the admin workspace records.`
            : ''
        }
        onPrimaryAction={() => {
          if (pendingRemoval) {
            handleRemoveUser(pendingRemoval)
          }
          setPendingRemoval(null)
        }}
        onSecondaryAction={() => setPendingRemoval(null)}
        open={Boolean(pendingRemoval)}
        primaryActionClassName="action-button-secondary border-rose-200 text-rose-600 hover:bg-rose-50"
        primaryActionLabel="Remove user"
        title="Remove user"
      />
    </AppShell>
  )
}

export default AdminUsersPage
