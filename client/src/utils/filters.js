import { defaultSearchFilters } from '../data/mockData'

export const filtersFromSearchParams = (searchParams) => ({
  ...defaultSearchFilters,
  location: searchParams.get('location') || '',
  roomType: searchParams.get('roomType') || '',
  maxPrice: searchParams.get('maxPrice') || '',
  amenities: searchParams.get('amenities')
    ? searchParams.get('amenities').split(',')
    : [],
})

export const filtersToSearchParams = (filters) => {
  const params = new URLSearchParams()

  if (filters.location) {
    params.set('location', filters.location)
  }

  if (filters.roomType) {
    params.set('roomType', filters.roomType)
  }

  if (filters.maxPrice) {
    params.set('maxPrice', filters.maxPrice)
  }

  if (filters.amenities?.length) {
    params.set('amenities', filters.amenities.join(','))
  }

  return params
}

export const filterRooms = (rooms, filters) =>
  rooms.filter((room) => {
    const matchesLocation = filters.location
      ? `${room.location} ${room.area}`
          .toLowerCase()
          .includes(filters.location.toLowerCase())
      : true

    const matchesType = filters.roomType
      ? room.roomType === filters.roomType
      : true

    const matchesPrice = filters.maxPrice
      ? room.price <= Number(filters.maxPrice)
      : true

    const matchesAmenities = filters.amenities?.length
      ? filters.amenities.every((amenity) => room.amenities.includes(amenity))
      : true

    return matchesLocation && matchesType && matchesPrice && matchesAmenities
  })
