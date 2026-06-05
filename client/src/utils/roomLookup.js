import { mockRooms } from '../data/mockData'

export const resolveRoomDigitalAddress = (room) => {
  if (room?.digitalAddress) {
    return room.digitalAddress
  }

  const fallbackRoom = mockRooms.find(
    (candidate) =>
      candidate.id === room?.id ||
      (candidate.title === room?.title &&
        candidate.area === room?.area &&
        candidate.location === room?.location),
  )

  return fallbackRoom?.digitalAddress || ''
}
