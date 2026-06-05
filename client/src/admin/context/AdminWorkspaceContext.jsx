/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  removeStoredLandlordRoom,
  syncStoredLandlordRoomStatus,
} from '../../utils/landlordRoomStorage'
import { persistAdminWorkspace, loadAdminWorkspace } from '../services/adminService'

const AdminWorkspaceContext = createContext(null)

const createMessage = (text) => ({
  id: `message-admin-${Date.now()}`,
  sender: 'admin',
  text,
  createdAt: new Date().toISOString(),
})

const createActivityEntry = (title, detail, badge = 'Updated') => ({
  id: `activity-admin-${Date.now()}`,
  title,
  detail,
  badge,
  createdAt: new Date().toISOString(),
})

export function AdminWorkspaceProvider({ children }) {
  const [workspace, setWorkspace] = useState(() => loadAdminWorkspace())

  useEffect(() => {
    const handleWorkspaceSync = () => {
      setWorkspace(loadAdminWorkspace())
    }

    window.addEventListener('findroom-admin-workspace-sync', handleWorkspaceSync)
    window.addEventListener('storage', handleWorkspaceSync)

    return () => {
      window.removeEventListener('findroom-admin-workspace-sync', handleWorkspaceSync)
      window.removeEventListener('storage', handleWorkspaceSync)
    }
  }, [])

  const commitWorkspace = (updater) => {
    setWorkspace((current) => {
      const nextWorkspace = typeof updater === 'function' ? updater(current) : updater
      persistAdminWorkspace(nextWorkspace)
      return nextWorkspace
    })
  }

  const appendActivity = (entry) => {
    commitWorkspace((current) => ({
      ...current,
      activityFeed: [entry, ...current.activityFeed].slice(0, 8),
    }))
  }

  const toggleUserStatus = (userId) => {
    commitWorkspace((current) => {
      const nextUsers = current.users.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' }
          : user,
      )

      return { ...current, users: nextUsers }
    })
  }

  const removeUser = (userId) => {
    const user = workspace.users.find((candidate) => candidate.id === userId)
    commitWorkspace((current) => ({
      ...current,
      users: current.users.filter((candidate) => candidate.id !== userId),
    }))

    if (user) {
      appendActivity(createActivityEntry(user.name, 'User removed from platform', 'Removed'))
    }
  }

  const promoteUserToAdmin = (userId) => {
    const targetUser = workspace.users.find((candidate) => candidate.id === userId)

    if (!targetUser || String(targetUser.role).toLowerCase() === 'admin') {
      return
    }

    commitWorkspace((current) => ({
      ...current,
      users: current.users.map((candidate) =>
        candidate.id === userId ? { ...candidate, role: 'Admin' } : candidate,
      ),
    }))

    appendActivity(createActivityEntry(targetUser.name, 'User granted admin access', 'Admin'))
  }

  const revokeUserAdminAccess = (userId) => {
    const targetUser = workspace.users.find((candidate) => candidate.id === userId)

    if (!targetUser || String(targetUser.role).toLowerCase() !== 'admin') {
      return
    }

    commitWorkspace((current) => ({
      ...current,
      users: current.users.map((candidate) =>
        candidate.id === userId ? { ...candidate, role: 'User' } : candidate,
      ),
    }))

    appendActivity(createActivityEntry(targetUser.name, 'Admin access removed', 'User'))
  }

  const toggleLandlordStatus = (landlordId) => {
    commitWorkspace((current) => {
      const nextLandlords = current.landlords.map((landlord) =>
        landlord.id === landlordId
          ? { ...landlord, status: landlord.status === 'Active' ? 'Inactive' : 'Active' }
          : landlord,
      )

      return { ...current, landlords: nextLandlords }
    })
  }

  const removeLandlord = (landlordId) => {
    const landlord = workspace.landlords.find((candidate) => candidate.id === landlordId)
    commitWorkspace((current) => ({
      ...current,
      landlords: current.landlords.filter((candidate) => candidate.id !== landlordId),
      listings: current.listings.filter((listing) => listing.landlordId !== landlordId),
    }))

    if (landlord) {
      appendActivity(createActivityEntry(landlord.name, 'Landlord removed from platform', 'Removed'))
    }
  }

  const updateListingStatus = (listingId, status) => {
    commitWorkspace((current) => ({
      ...current,
      listings: current.listings.map((listing) =>
        listing.id === listingId ? { ...listing, status } : listing,
      ),
    }))

    syncStoredLandlordRoomStatus(listingId, status)

    const listing = workspace.listings.find((candidate) => candidate.id === listingId)
    if (listing) {
      appendActivity(createActivityEntry(listing.title, `Listing marked as ${status.toLowerCase()}`, status))
    }
  }

  const saveListing = (listingId, updates) => {
    commitWorkspace((current) => ({
      ...current,
      listings: current.listings.map((listing) =>
        listing.id === listingId ? { ...listing, ...updates } : listing,
      ),
    }))
  }

  const deleteListing = (listingId) => {
    const listing = workspace.listings.find((candidate) => candidate.id === listingId)

    commitWorkspace((current) => ({
      ...current,
      listings: current.listings.filter((candidate) => candidate.id !== listingId),
      bookings: current.bookings.filter((booking) => booking.listingId !== listingId),
    }))
    removeStoredLandlordRoom(listingId)

    if (listing) {
      appendActivity(createActivityEntry(listing.title, 'Listing deleted from platform', 'Removed'))
    }
  }

  const updateBookingStatus = (bookingId, status) => {
    commitWorkspace((current) => ({
      ...current,
      bookings: current.bookings.map((booking) =>
        booking.id === bookingId ? { ...booking, status } : booking,
      ),
    }))
  }

  const sendConversationReply = (conversationId, text) => {
    const trimmedText = text.trim()

    if (!trimmedText) {
      return false
    }

    commitWorkspace((current) => ({
      ...current,
      conversations: current.conversations.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              messages: [...conversation.messages, createMessage(trimmedText)],
              unreadCount: 0,
            }
          : conversation,
      ),
    }))

    return true
  }

  const saveSettingsSection = (sectionKey, values) => {
    commitWorkspace((current) => ({
      ...current,
      settings: {
        ...current.settings,
        [sectionKey]: {
          ...current.settings[sectionKey],
          ...values,
        },
      },
    }))
  }

  const value = useMemo(
    () => ({
      workspace,
      toggleUserStatus,
      removeUser,
      promoteUserToAdmin,
      revokeUserAdminAccess,
      toggleLandlordStatus,
      removeLandlord,
      updateListingStatus,
      saveListing,
      deleteListing,
      updateBookingStatus,
      sendConversationReply,
      saveSettingsSection,
    }),
    [workspace],
  )

  return <AdminWorkspaceContext.Provider value={value}>{children}</AdminWorkspaceContext.Provider>
}

export const useAdminWorkspaceContext = () => {
  const context = useContext(AdminWorkspaceContext)

  if (!context) {
    throw new Error('useAdminWorkspaceContext must be used within AdminWorkspaceProvider')
  }

  return context
}
