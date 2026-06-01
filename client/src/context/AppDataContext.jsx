/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  mockAdminStats,
  mockBookings,
  mockPayments,
  mockPlatformUsers,
  mockRecentActivity,
  mockRooms,
  mockThreads,
  mockUsers,
} from '../data/mockData'
import api from '../lib/api'
import { upsertAdminWorkspaceLandlord } from '../admin/services/adminService'
import { resolveAllowedRoles } from '../utils/roles'
import { useAuth } from './AuthContext'

const AppDataContext = createContext(null)

const favoritesKeyFor = (userId) => `findroom-favorites:${userId}`
const LANDLORD_ROOMS_STORAGE_KEY = 'findroom-landlord-rooms'
const LANDLORD_ROOM_OVERRIDES_STORAGE_KEY = 'findroom-landlord-room-overrides'
const LANDLORD_DELETED_ROOM_IDS_STORAGE_KEY = 'findroom-landlord-deleted-room-ids'
const MOCK_USERS_STORAGE_KEY = 'findroom-mock-users'
const PLATFORM_USER_OVERRIDES_STORAGE_KEY = 'findroom-platform-user-overrides'

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const roomIdsForLandlord = (rooms, landlordId) =>
  rooms.filter((room) => room.landlordId === landlordId).map((room) => room.id)

const readStoredJson = (key, fallback) => {
  if (typeof window === 'undefined') {
    return fallback
  }

  const stored = window.localStorage.getItem(key)

  if (!stored) {
    return fallback
  }

  try {
    return JSON.parse(stored)
  } catch {
    return fallback
  }
}

const getStoredLandlordRooms = () => {
  const parsed = readStoredJson(LANDLORD_ROOMS_STORAGE_KEY, [])
  return Array.isArray(parsed) ? parsed : []
}

const getStoredLandlordRoomOverrides = () => {
  const parsed = readStoredJson(LANDLORD_ROOM_OVERRIDES_STORAGE_KEY, {})
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
}

const getStoredDeletedRoomIds = () => {
  const parsed = readStoredJson(LANDLORD_DELETED_ROOM_IDS_STORAGE_KEY, [])
  return Array.isArray(parsed) ? parsed : []
}

const getStoredPlatformUsers = () => {
  const parsed = readStoredJson(MOCK_USERS_STORAGE_KEY, mockPlatformUsers)
  return Array.isArray(parsed) ? parsed : mockPlatformUsers
}

const normalizeUserLookupValue = (value = '') => String(value).trim().toLowerCase()

const getPlatformUserLookupKey = (user = {}) => user.id || normalizeUserLookupValue(user.email)

const getStoredPlatformUserOverrides = () => {
  const parsed = readStoredJson(PLATFORM_USER_OVERRIDES_STORAGE_KEY, [])
  return Array.isArray(parsed) ? parsed : []
}

const persistLandlordRooms = (rooms) => {
  window.localStorage.setItem(LANDLORD_ROOMS_STORAGE_KEY, JSON.stringify(rooms))
}

const persistLandlordRoomOverrides = (overrides) => {
  window.localStorage.setItem(
    LANDLORD_ROOM_OVERRIDES_STORAGE_KEY,
    JSON.stringify(overrides),
  )
}

const persistDeletedRoomIds = (roomIds) => {
  window.localStorage.setItem(
    LANDLORD_DELETED_ROOM_IDS_STORAGE_KEY,
    JSON.stringify(roomIds),
  )
}

const persistPlatformUsers = (users) => {
  window.localStorage.setItem(MOCK_USERS_STORAGE_KEY, JSON.stringify(users))
}

const persistPlatformUserOverrides = (users) => {
  window.localStorage.setItem(PLATFORM_USER_OVERRIDES_STORAGE_KEY, JSON.stringify(users))
}

const updateStoredPlatformUsers = (updater) => {
  const currentUsers = getStoredPlatformUsers()
  const nextUsers = typeof updater === 'function' ? updater(currentUsers) : updater
  persistPlatformUsers(nextUsers)
  return nextUsers
}

const updateStoredPlatformUserOverrides = (updater) => {
  const currentUsers = getStoredPlatformUserOverrides()
  const nextUsers = typeof updater === 'function' ? updater(currentUsers) : updater
  persistPlatformUserOverrides(nextUsers)
  return nextUsers
}

const mergePlatformUsers = (baseUsers = [], overrideUsers = []) => {
  const mergedUsers = []
  const seenKeys = new Set()
  const overrideLookup = new Map(
    overrideUsers
      .map((candidate) => [getPlatformUserLookupKey(candidate), candidate])
      .filter(([key]) => key),
  )

  baseUsers.forEach((candidate) => {
    const lookupKey = getPlatformUserLookupKey(candidate)
    const overrideCandidate = lookupKey ? overrideLookup.get(lookupKey) : null
    const mergedCandidate = overrideCandidate ? { ...candidate, ...overrideCandidate } : candidate

    if (lookupKey) {
      seenKeys.add(lookupKey)
    }

    mergedUsers.push(mergedCandidate)
  })

  overrideUsers.forEach((candidate) => {
    const lookupKey = getPlatformUserLookupKey(candidate)

    if (!lookupKey || seenKeys.has(lookupKey)) {
      return
    }

    seenKeys.add(lookupKey)
    mergedUsers.push(candidate)
  })

  return mergedUsers
}

const mergeRooms = (baseRooms, addedRooms) => {
  const seen = new Set()
  const merged = []

  ;[...addedRooms, ...baseRooms].forEach((room) => {
    if (room?.id && !seen.has(room.id)) {
      seen.add(room.id)
      merged.push(room)
    }
  })

  return merged
}

const applyStoredRoomMutations = (baseRooms, addedRooms, roomOverrides, deletedRoomIds) =>
  mergeRooms(baseRooms, addedRooms)
    .filter((room) => room?.id && !deletedRoomIds.includes(room.id))
    .map((room) => (roomOverrides[room.id] ? { ...room, ...roomOverrides[room.id] } : room))

const parseRoomLocation = (value = '') => {
  const parts = String(value)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (!parts.length) {
    return { area: 'Location unavailable', location: 'Location unavailable' }
  }

  if (parts.length === 1) {
    return { area: parts[0], location: parts[0] }
  }

  return {
    area: parts[0],
    location: parts.slice(1).join(', '),
  }
}

export function AppDataProvider({ children }) {
  const { user, updateSessionUser } = useAuth()
  const [rooms, setRooms] = useState(mockRooms)
  const [bookings, setBookings] = useState([])
  const [threads, setThreads] = useState([])
  const [payments, setPayments] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [favorites, setFavorites] = useState([])
  const [adminStats, setAdminStats] = useState(mockAdminStats)
  const [platformUsers, setPlatformUsers] = useState(() =>
    mergePlatformUsers(getStoredPlatformUsers(), getStoredPlatformUserOverrides()),
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadRooms = async () => {
      const storedLandlordRooms = getStoredLandlordRooms()
      const storedRoomOverrides = getStoredLandlordRoomOverrides()
      const storedDeletedRoomIds = getStoredDeletedRoomIds()

      try {
        const response = await api.get('/rooms')
        setRooms(
          applyStoredRoomMutations(
            response.data.rooms || response.data,
            storedLandlordRooms,
            storedRoomOverrides,
            storedDeletedRoomIds,
          ),
        )
      } catch {
        setRooms(
          applyStoredRoomMutations(
            mockRooms,
            storedLandlordRooms,
            storedRoomOverrides,
            storedDeletedRoomIds,
          ),
        )
      }
    }

    loadRooms()
  }, [])

  useEffect(() => {
    setPlatformUsers(
      mergePlatformUsers(getStoredPlatformUsers(), getStoredPlatformUserOverrides()),
    )
  }, [user])

  useEffect(() => {
    const loadPrivateData = async () => {
      if (!user) {
        setBookings([])
        setThreads([])
        setPayments([])
        setRecentActivity([])
        setFavorites([])
        setPlatformUsers(
          mergePlatformUsers(getStoredPlatformUsers(), getStoredPlatformUserOverrides()),
        )
        return
      }

      setLoading(true)

      const storedFavorites = window.localStorage.getItem(favoritesKeyFor(user.id))
      setFavorites(storedFavorites ? JSON.parse(storedFavorites) : [])

      try {
        const requests = [
          api.get('/bookings/me'),
          api.get('/messages/conversations'),
          api.get('/payments/me'),
          api.get('/dashboard/overview'),
        ]

        if (user.role === 'admin') {
          requests.push(api.get('/admin/stats'), api.get('/admin/users'))
        }

        const responses = await Promise.all(requests)
        setBookings(responses[0].data.bookings || [])
        setThreads(responses[1].data.threads || [])
        setPayments(responses[2].data.payments || [])
        setRecentActivity(responses[3].data.recentActivity || [])

        if (user.role === 'admin') {
          setAdminStats(responses[4].data.stats || mockAdminStats)
          setPlatformUsers(
            mergePlatformUsers(
              responses[5].data.users?.length ? responses[5].data.users : getStoredPlatformUsers(),
              getStoredPlatformUserOverrides(),
            ),
          )
        }
      } catch {
        const landlordRoomIds = roomIdsForLandlord(mockRooms, user.id)

        setBookings(
          user.role === 'landlord'
            ? mockBookings.filter((booking) => landlordRoomIds.includes(booking.roomId))
            : user.role === 'admin'
              ? mockBookings
              : mockBookings.filter((booking) => booking.userId === user.id),
        )

        setThreads(
          mockThreads.filter((thread) =>
            user.role === 'admin'
              ? true
              : thread.userId === user.id || thread.landlordId === user.id,
          ),
        )

        setPayments(
          user.role === 'landlord'
            ? mockPayments.filter((payment) => {
                const booking = mockBookings.find(
                  (candidate) => candidate.id === payment.bookingId,
                )
                return landlordRoomIds.includes(booking?.roomId)
              })
            : user.role === 'admin'
              ? mockPayments
              : mockPayments.filter((payment) => payment.userId === user.id),
        )

        setRecentActivity(mockRecentActivity)
        setAdminStats(mockAdminStats)
        setPlatformUsers(
          mergePlatformUsers(getStoredPlatformUsers(), getStoredPlatformUserOverrides()),
        )
      } finally {
        setLoading(false)
      }
    }

    loadPrivateData()
  }, [user])

  const persistFavorites = (nextFavorites) => {
    if (!user) {
      return
    }

    setFavorites(nextFavorites)
    window.localStorage.setItem(
      favoritesKeyFor(user.id),
      JSON.stringify(nextFavorites),
    )
  }

  const toggleFavorite = (roomId) => {
    if (!user) {
      return false
    }

    const nextFavorites = favorites.includes(roomId)
      ? favorites.filter((item) => item !== roomId)
      : [...favorites, roomId]

    persistFavorites(nextFavorites)
    return true
  }

  const bookRoom = async ({
    roomId,
    startDate,
    durationMonths = 1,
    duration,
    amount,
    guestName,
    guestEmail,
    guestPhone,
  }) => {
    const room = rooms.find((candidate) => candidate.id === roomId)

    if (!user || !room) {
      return
    }

    const normalizedDurationMonths = Number.parseInt(durationMonths, 10)
    const safeDurationMonths =
      Number.isFinite(normalizedDurationMonths) && normalizedDurationMonths > 0
        ? normalizedDurationMonths
        : 1
    const normalizedAmount = Number.isFinite(Number(amount))
      ? Number(amount)
      : room.price * safeDurationMonths
    const fallbackBooking = {
      id: `booking-${Date.now()}`,
      roomId: room.id,
      userId: user.id,
      roomTitle: room.title,
      amount: normalizedAmount,
      startDate: startDate || room.availableFrom,
      duration: duration || `${safeDurationMonths} month${safeDurationMonths === 1 ? '' : 's'}`,
      durationMonths: safeDurationMonths,
      guestName: guestName || user.name,
      guestEmail: guestEmail || user.email,
      guestPhone: guestPhone || user.phone || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    try {
      const response = await api.post('/bookings', {
        roomId,
        startDate: fallbackBooking.startDate,
        duration: fallbackBooking.duration,
        durationMonths: fallbackBooking.durationMonths,
        amount: fallbackBooking.amount,
        guestName: fallbackBooking.guestName,
        guestEmail: fallbackBooking.guestEmail,
        guestPhone: fallbackBooking.guestPhone,
      })
      const apiBooking = response.data.booking || {}
      const booking = {
        ...apiBooking,
        ...fallbackBooking,
        id: apiBooking.id || fallbackBooking.id,
        status: apiBooking.status || fallbackBooking.status,
        createdAt: apiBooking.createdAt || fallbackBooking.createdAt,
      }
      setBookings((current) => [booking, ...current])
      return booking
    } catch {
      setBookings((current) => [fallbackBooking, ...current])
      setRecentActivity((current) => [
        {
          id: `activity-${Date.now()}`,
          title: 'Booking requested',
          description: `You requested ${room.title} for ${fallbackBooking.duration}.`,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ])
      return fallbackBooking
    }
  }

  const sendMessage = async ({ roomId, recipientId, text }) => {
    if (!user || !text.trim()) {
      return
    }

    try {
      const response = await api.post('/messages', { roomId, recipientId, text })
      setThreads((current) => {
        const existing = current.find((thread) => thread.id === response.data.thread.id)
        if (!existing) {
          return [response.data.thread, ...current]
        }

        return current.map((thread) =>
          thread.id === response.data.thread.id ? response.data.thread : thread,
        )
      })
      return
    } catch {
      setThreads((current) => {
        const existing = current.find(
          (thread) =>
            thread.roomId === roomId &&
            ((thread.userId === user.id && thread.landlordId === recipientId) ||
              (thread.landlordId === user.id && thread.userId === recipientId)),
        )

        const message = {
          id: `msg-${Date.now()}`,
          senderId: user.id,
          text,
          createdAt: new Date().toISOString(),
        }

        if (!existing) {
          return [
            {
              id: `thread-${Date.now()}`,
              roomId,
              userId: user.role === 'landlord' ? recipientId : user.id,
              landlordId: user.role === 'landlord' ? user.id : recipientId,
              lastMessageAt: message.createdAt,
              messages: [message],
            },
            ...current,
          ]
        }

        return current.map((thread) =>
          thread.id === existing.id
            ? {
                ...thread,
                lastMessageAt: message.createdAt,
                messages: [...thread.messages, message],
              }
            : thread,
        )
      })
    }
  }

  const runMockPayment = async ({
    bookingId,
    amount,
    method,
    paymentChannel,
    paymentPhone,
    cardLast4,
    bookingSnapshot,
  }) => {
    const booking = bookings.find((item) => item.id === bookingId) || bookingSnapshot

    if (!user || !booking) {
      return
    }

    const normalizedAmount = Number.isFinite(Number(amount))
      ? Number(amount)
      : booking.amount
    const fallbackPayment = {
      id: `payment-${Date.now()}`,
      bookingId,
      userId: user.id,
      amount: normalizedAmount,
      method: method || 'Mock Card',
      paymentChannel: paymentChannel || 'card',
      paymentPhone: paymentPhone || '',
      cardLast4: cardLast4 || '',
      status: 'successful',
      createdAt: new Date().toISOString(),
    }

    try {
      const response = await api.post('/payments/mock-checkout', {
        bookingId,
        amount: fallbackPayment.amount,
        method: fallbackPayment.method,
        paymentChannel: fallbackPayment.paymentChannel,
        paymentPhone: fallbackPayment.paymentPhone,
        cardLast4: fallbackPayment.cardLast4,
      })
      const apiPayment = response.data.payment || {}
      const payment = {
        ...apiPayment,
        ...fallbackPayment,
        id: apiPayment.id || fallbackPayment.id,
        amount: apiPayment.amount ?? fallbackPayment.amount,
        status: apiPayment.status || fallbackPayment.status,
        createdAt: apiPayment.createdAt || fallbackPayment.createdAt,
      }
      setPayments((current) => [payment, ...current])
      setBookings((current) =>
        current.map((item) =>
          item.id === bookingId ? { ...item, status: 'approved' } : item,
        ),
      )
      setRecentActivity((current) => [
        {
          id: `activity-${Date.now()}`,
          title: 'Payment completed',
          description: `You paid ${payment.method} for ${booking.roomTitle}.`,
          createdAt: payment.createdAt,
        },
        ...current,
      ])
      return payment
    } catch {
      setPayments((current) => [fallbackPayment, ...current])
      setBookings((current) =>
        current.map((item) =>
          item.id === bookingId ? { ...item, status: 'approved' } : item,
        ),
      )
      setRecentActivity((current) => [
        {
          id: `activity-${Date.now()}`,
          title: 'Payment completed',
          description: `You paid ${fallbackPayment.method} for ${booking.roomTitle}.`,
          createdAt: fallbackPayment.createdAt,
        },
        ...current,
      ])
      return fallbackPayment
    }
  }

  const createListing = async (payload) => {
    if (!user) {
      return null
    }

    const normalizedDescription = payload.description.trim()
    const normalizedLocation = parseRoomLocation(payload.location)
    const images =
      payload.imageFiles?.length
        ? await Promise.all(payload.imageFiles.map((file) => fileToDataUrl(file)))
        : ['/landing/hero-room.jpg']
    const createdAt = new Date().toISOString()
    const nextRoom = {
      id: `room-${Date.now()}`,
      title: payload.title.trim(),
      location: normalizedLocation.location,
      area: normalizedLocation.area,
      digitalAddress: payload.digitalAddress.trim(),
      roomType: payload.roomType,
      price: Number(payload.price),
      rating: 5,
      status: 'approved',
      landlordId: user.id,
      landlordName: user.name,
      availableFrom: createdAt.slice(0, 10),
      images,
      accent: 'from-brand-100 to-brand-50',
      amenities: payload.amenities?.length ? payload.amenities : ['Security'],
      description:
        normalizedDescription ||
        `Comfortable ${payload.roomType.toLowerCase()} in ${normalizedLocation.area}.`,
      summary:
        normalizedDescription.length > 120
          ? `${normalizedDescription.slice(0, 117)}...`
          : normalizedDescription ||
            `Comfortable ${payload.roomType.toLowerCase()} in ${normalizedLocation.area}.`,
    }

    setRooms((current) => {
      const nextRooms = [nextRoom, ...current]
      const storedRooms = getStoredLandlordRooms()
      const storedRoomOverrides = getStoredLandlordRoomOverrides()
      const storedDeletedRoomIds = getStoredDeletedRoomIds()

      persistLandlordRooms([nextRoom, ...storedRooms.filter((room) => room.id !== nextRoom.id)])
      delete storedRoomOverrides[nextRoom.id]
      persistLandlordRoomOverrides(storedRoomOverrides)
      persistDeletedRoomIds(storedDeletedRoomIds.filter((roomId) => roomId !== nextRoom.id))
      return nextRooms
    })

    setRecentActivity((current) => [
      {
        id: `activity-${Date.now()}`,
        title: 'Listing submitted',
        description: `${nextRoom.title} was submitted successfully and is now visible in search listings.`,
        createdAt,
      },
      ...current,
    ])

    return nextRoom
  }

  const updateListing = async (roomId, payload) => {
    if (!user) {
      return null
    }

    const existingRoom = rooms.find((room) => room.id === roomId)

    if (!existingRoom || existingRoom.landlordId !== user.id) {
      return null
    }

    const normalizedDescription = payload.description.trim()
    const normalizedLocation = parseRoomLocation(payload.location)
    const nextImages =
      payload.imageFiles?.length
        ? await Promise.all(payload.imageFiles.map((file) => fileToDataUrl(file)))
        : existingRoom.images
    const updatedRoom = {
      ...existingRoom,
      title: payload.title.trim(),
      location: normalizedLocation.location,
      area: normalizedLocation.area,
      digitalAddress: payload.digitalAddress.trim(),
      roomType: payload.roomType,
      price: Number(payload.price),
      images: nextImages,
      amenities: payload.amenities?.length ? payload.amenities : existingRoom.amenities,
      description:
        normalizedDescription ||
        existingRoom.description ||
        `Comfortable ${payload.roomType.toLowerCase()} in ${normalizedLocation.area}.`,
      summary:
        normalizedDescription.length > 120
          ? `${normalizedDescription.slice(0, 117)}...`
          : normalizedDescription ||
            existingRoom.summary ||
            `Comfortable ${payload.roomType.toLowerCase()} in ${normalizedLocation.area}.`,
    }

    setRooms((current) => current.map((room) => (room.id === roomId ? updatedRoom : room)))

    const storedRooms = getStoredLandlordRooms()
    const isStoredAddedRoom = storedRooms.some((room) => room.id === roomId)
    if (isStoredAddedRoom) {
      persistLandlordRooms(
        storedRooms.map((room) => (room.id === roomId ? updatedRoom : room)),
      )
    }

    const storedRoomOverrides = getStoredLandlordRoomOverrides()
    if (isStoredAddedRoom) {
      delete storedRoomOverrides[roomId]
    } else {
      storedRoomOverrides[roomId] = updatedRoom
    }
    persistLandlordRoomOverrides(storedRoomOverrides)

    setRecentActivity((current) => [
      {
        id: `activity-${Date.now()}`,
        title: 'Listing updated',
        description: `${updatedRoom.title} was updated successfully.`,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ])

    return updatedRoom
  }

  const deleteListing = async (roomId) => {
    if (!user) {
      return false
    }

    const roomToDelete = rooms.find((room) => room.id === roomId)

    if (!roomToDelete || roomToDelete.landlordId !== user.id) {
      return false
    }

    setRooms((current) => current.filter((room) => room.id !== roomId))

    const storedRooms = getStoredLandlordRooms()
    const nextStoredRooms = storedRooms.filter((room) => room.id !== roomId)
    const deletedStoredRoom = nextStoredRooms.length !== storedRooms.length
    persistLandlordRooms(nextStoredRooms)

    const storedRoomOverrides = getStoredLandlordRoomOverrides()
    delete storedRoomOverrides[roomId]
    persistLandlordRoomOverrides(storedRoomOverrides)

    const storedDeletedRoomIds = getStoredDeletedRoomIds()
    const nextDeletedRoomIds = deletedStoredRoom
      ? storedDeletedRoomIds.filter((candidate) => candidate !== roomId)
      : Array.from(new Set([...storedDeletedRoomIds, roomId]))
    persistDeletedRoomIds(nextDeletedRoomIds)

    setRecentActivity((current) => [
      {
        id: `activity-${Date.now()}`,
        title: 'Listing deleted',
        description: `${roomToDelete.title} was removed from your listings.`,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ])

    return true
  }

  const updateProfile = async (payload) => {
    if (!user) {
      return
    }

    const updates = { ...payload }

    if (payload.avatarFile) {
      try {
        const formData = new FormData()
        formData.append('avatar', payload.avatarFile)
        const uploadResponse = await api.post('/users/me/avatar', formData)
        updates.avatar = uploadResponse.data.avatarUrl
      } catch {
        updates.avatar = await fileToDataUrl(payload.avatarFile)
      }
    }

    delete updates.avatarFile

    try {
      const response = await api.put('/users/me', updates)
      updateSessionUser(response.data.user)
    } catch {
      updateSessionUser(updates)
    }
  }

  const moderateListing = async (roomId, status) => {
    try {
      await api.patch(`/admin/listings/${roomId}/status`, { status })
      setRooms((current) =>
        current.map((room) => (room.id === roomId ? { ...room, status } : room)),
      )
    } catch {
      setRooms((current) =>
        current.map((room) => (room.id === roomId ? { ...room, status } : room)),
      )
    }
  }

  const removePlatformUser = async (userId) => {
    const nextUsers = getStoredPlatformUsers().filter((candidate) => candidate.id !== userId)

    try {
      await api.delete(`/admin/users/${userId}`)
    } catch {
      // Fall back to local state below when the mock API is unavailable.
    }

    persistPlatformUsers(nextUsers)
    setPlatformUsers(nextUsers)
  }

  const togglePlatformUserStatus = (userId) => {
    const nextUsers = updateStoredPlatformUsers((currentUsers) =>
      currentUsers.map((candidate) =>
        candidate.id === userId
          ? {
              ...candidate,
              status: candidate.status === 'Inactive' ? 'Active' : 'Inactive',
            }
          : candidate,
      ),
    )

    setPlatformUsers(nextUsers)

    if (user?.id === userId) {
      const matchingUser = nextUsers.find((candidate) => candidate.id === userId)

      if (matchingUser) {
        updateSessionUser({ status: matchingUser.status })
      }
    }
  }

  const grantPlatformUserAdminAccess = (userId) => {
    let nextRolesForCurrentUser = null

    const nextUsers = updateStoredPlatformUsers((currentUsers) =>
      currentUsers.map((candidate) => {
        if (candidate.id !== userId) {
          return candidate
        }

        const nextRoles = Array.from(
          new Set([...resolveAllowedRoles(candidate), 'user', 'admin']),
        )

        if (user?.id === userId) {
          nextRolesForCurrentUser = nextRoles
        }

        return {
          ...candidate,
          roles: nextRoles,
        }
      }),
    )

    setPlatformUsers(nextUsers)

    if (user?.id === userId && nextRolesForCurrentUser) {
      updateSessionUser({ roles: nextRolesForCurrentUser })
    }
  }

  const revokePlatformUserAdminAccess = (userId) => {
    let nextSessionUpdate = null

    const nextUsers = updateStoredPlatformUsers((currentUsers) =>
      currentUsers.map((candidate) => {
        if (candidate.id !== userId) {
          return candidate
        }

        const nextRoles = resolveAllowedRoles(candidate).filter((role) => role !== 'admin')
        const fallbackRole = nextRoles[0] || 'user'
        const nextRole =
          candidate.role && nextRoles.includes(candidate.role) ? candidate.role : fallbackRole

        if (user?.id === userId) {
          nextSessionUpdate = {
            role: user.role && nextRoles.includes(user.role) ? user.role : fallbackRole,
            roles: nextRoles.length ? nextRoles : ['user'],
          }
        }

        return {
          ...candidate,
          role: nextRole,
          roles: nextRoles.length ? nextRoles : ['user'],
        }
      }),
    )

    setPlatformUsers(nextUsers)

    if (user?.id === userId && nextSessionUpdate) {
      updateSessionUser(nextSessionUpdate)
    }
  }

  const reviewLandlordVerification = async (userId, status) => {
    const reviewedAt = new Date().toISOString()
    let reviewedUser = null

    try {
      const response = await api.patch(`/admin/users/${userId}/verification`, { status })
      reviewedUser = response.data.user || null
    } catch {
      reviewedUser = null
    }

    const nextUsers = platformUsers.map((candidate) =>
      candidate.id === userId
        ? {
            ...candidate,
            ...(reviewedUser || {}),
            landlordVerificationStatus:
              reviewedUser?.landlordVerificationStatus || status,
            landlordVerificationReviewedAt:
              reviewedUser?.landlordVerificationReviewedAt || reviewedAt,
          }
        : candidate,
    )

    const updatedReviewedUser = nextUsers.find((candidate) => candidate.id === userId)

    if (updatedReviewedUser) {
      updateStoredPlatformUserOverrides((currentUsers) => {
        const lookupKey = getPlatformUserLookupKey(updatedReviewedUser)
        let matched = false
        const mergedOverrides = currentUsers.map((candidate) => {
          if (getPlatformUserLookupKey(candidate) !== lookupKey) {
            return candidate
          }

          matched = true
          return { ...candidate, ...updatedReviewedUser }
        })

        return matched ? mergedOverrides : [updatedReviewedUser, ...mergedOverrides]
      })

      if (status === 'approved') {
        const landlordRooms = rooms.filter((room) => room.landlordId === updatedReviewedUser.id)
        upsertAdminWorkspaceLandlord({
          id: updatedReviewedUser.id,
          name: updatedReviewedUser.name,
          email: updatedReviewedUser.email,
          properties: landlordRooms.length,
          joinedDate:
            updatedReviewedUser.landlordVerificationReviewedAt ||
            updatedReviewedUser.landlordVerificationSubmittedAt ||
            updatedReviewedUser.createdAt ||
            reviewedAt,
          status: updatedReviewedUser.status === 'blocked' ? 'Inactive' : 'Active',
          avatar: updatedReviewedUser.avatar,
          phone:
            updatedReviewedUser.phone ||
            updatedReviewedUser.landlordVerification?.phone ||
            'Not provided',
        })
      }
    }

    setPlatformUsers(nextUsers)

    if (user?.id === userId) {
      updateSessionUser({
        landlordVerificationStatus:
          updatedReviewedUser?.landlordVerificationStatus || status,
        landlordVerificationReviewedAt:
          updatedReviewedUser?.landlordVerificationReviewedAt || reviewedAt,
      })
    }
  }

  const userMap = useMemo(
    () =>
      [user, ...mockUsers, ...platformUsers].filter(Boolean).reduce((accumulator, account) => {
        accumulator[account.id] = account
        return accumulator
      }, {}),
    [platformUsers, user],
  )

  const favoriteRooms = useMemo(
    () => rooms.filter((room) => favorites.includes(room.id)),
    [favorites, rooms],
  )

  const value = {
    rooms,
    bookings,
    threads,
    payments,
    recentActivity,
    favorites,
    favoriteRooms,
    adminStats,
    platformUsers,
    loading,
    userMap,
    toggleFavorite,
    bookRoom,
    sendMessage,
    runMockPayment,
    createListing,
    updateListing,
    deleteListing,
    updateProfile,
    moderateListing,
    removePlatformUser,
    togglePlatformUserStatus,
    grantPlatformUserAdminAccess,
    revokePlatformUserAdminAccess,
    reviewLandlordVerification,
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export const useAppData = () => {
  const context = useContext(AppDataContext)

  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider')
  }

  return context
}
