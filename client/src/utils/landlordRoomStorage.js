const LANDLORD_ROOMS_STORAGE_KEY = 'findroom-landlord-rooms'
const LANDLORD_ROOM_OVERRIDES_STORAGE_KEY = 'findroom-landlord-room-overrides'
const LANDLORD_DELETED_ROOM_IDS_STORAGE_KEY = 'findroom-landlord-deleted-room-ids'
export const LANDLORD_ROOM_SYNC_EVENT = 'findroom-landlord-room-sync'

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

const writeStoredJson = (key, value) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

const normalizeStatus = (status) => String(status || '').trim().toLowerCase()

export const getStoredLandlordRooms = () => {
  const parsed = readStoredJson(LANDLORD_ROOMS_STORAGE_KEY, [])
  return Array.isArray(parsed) ? parsed : []
}

export const getStoredLandlordRoomOverrides = () => {
  const parsed = readStoredJson(LANDLORD_ROOM_OVERRIDES_STORAGE_KEY, {})
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
}

export const getStoredDeletedRoomIds = () => {
  const parsed = readStoredJson(LANDLORD_DELETED_ROOM_IDS_STORAGE_KEY, [])
  return Array.isArray(parsed) ? parsed : []
}

export const persistLandlordRooms = (rooms) => {
  writeStoredJson(LANDLORD_ROOMS_STORAGE_KEY, rooms)
}

export const persistLandlordRoomOverrides = (overrides) => {
  writeStoredJson(LANDLORD_ROOM_OVERRIDES_STORAGE_KEY, overrides)
}

export const persistDeletedRoomIds = (roomIds) => {
  writeStoredJson(LANDLORD_DELETED_ROOM_IDS_STORAGE_KEY, roomIds)
}

export const dispatchLandlordRoomSync = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(new Event(LANDLORD_ROOM_SYNC_EVENT))
}

export const upsertStoredLandlordRoom = (room) => {
  if (typeof window === 'undefined' || !room?.id) {
    return null
  }

  const nextRoom = { ...room }
  const storedRooms = getStoredLandlordRooms()
  const storedRoomOverrides = getStoredLandlordRoomOverrides()
  const storedDeletedRoomIds = getStoredDeletedRoomIds()

  persistLandlordRooms([nextRoom, ...storedRooms.filter((candidate) => candidate.id !== nextRoom.id)])
  delete storedRoomOverrides[nextRoom.id]
  persistLandlordRoomOverrides(storedRoomOverrides)
  persistDeletedRoomIds(storedDeletedRoomIds.filter((roomId) => roomId !== nextRoom.id))

  return nextRoom
}

export const syncStoredLandlordRoomStatus = (roomId, status) => {
  if (typeof window === 'undefined' || !roomId) {
    return false
  }

  const normalizedStatus = normalizeStatus(status)

  if (!normalizedStatus) {
    return false
  }

  const storedRooms = getStoredLandlordRooms()
  let matched = false

  const nextRooms = storedRooms.map((room) => {
    if (room.id !== roomId) {
      return room
    }

    matched = true
    return { ...room, status: normalizedStatus }
  })

  if (matched) {
    persistLandlordRooms(nextRooms)
  }

  const storedRoomOverrides = getStoredLandlordRoomOverrides()
  if (storedRoomOverrides[roomId]) {
    storedRoomOverrides[roomId] = {
      ...storedRoomOverrides[roomId],
      status: normalizedStatus,
    }
    persistLandlordRoomOverrides(storedRoomOverrides)
    matched = true
  }

  if (matched) {
    dispatchLandlordRoomSync()
  }

  return matched
}

export const removeStoredLandlordRoom = (roomId) => {
  if (typeof window === 'undefined' || !roomId) {
    return false
  }

  const storedRooms = getStoredLandlordRooms()
  const nextRooms = storedRooms.filter((room) => room.id !== roomId)
  let removed = nextRooms.length !== storedRooms.length

  if (removed) {
    persistLandlordRooms(nextRooms)
  }

  const storedRoomOverrides = getStoredLandlordRoomOverrides()
  if (storedRoomOverrides[roomId]) {
    delete storedRoomOverrides[roomId]
    persistLandlordRoomOverrides(storedRoomOverrides)
    removed = true
  }

  if (removed) {
    persistDeletedRoomIds(getStoredDeletedRoomIds().filter((candidate) => candidate !== roomId))
    dispatchLandlordRoomSync()
  }

  return removed
}
