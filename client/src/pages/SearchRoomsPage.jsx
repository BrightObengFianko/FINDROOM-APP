import { SlidersHorizontal } from 'lucide-react'
import { startTransition, useDeferredValue, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import RoomCard from '../components/common/RoomCard'
import AppShell from '../components/layout/AppShell'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'
import { amenityCatalog, roomTypeOptions } from '../data/mockData'
import { filterRooms, filtersFromSearchParams, filtersToSearchParams } from '../utils/filters'

function SearchRoomsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { favorites, rooms, toggleFavorite } = useAppData()
  const { isAuthenticated } = useAuth()
  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams])
  const deferredLocation = useDeferredValue(filters.location)
  const filteredRooms = useMemo(
    () => filterRooms(rooms, { ...filters, location: deferredLocation }),
    [deferredLocation, filters, rooms],
  )

  const updateFilters = (updates) => {
    startTransition(() => {
      const nextFilters = { ...filters, ...updates }
      setSearchParams(filtersToSearchParams(nextFilters), { replace: true })
    })
  }

  return (
    <AppShell
      title="Search Rooms"
      subtitle="Browse verified rooms with prices in Ghana cedis, plus location and amenity filters."
      actions={
        <div className="inline-flex items-center gap-2 rounded-xl bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700">
          <SlidersHorizontal size={16} />
          {filteredRooms.length} results
        </div>
      }
    >
      <section className="section-card">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
          <input
            className="field"
            onChange={(event) => updateFilters({ location: event.target.value })}
            placeholder="Where"
            value={filters.location}
          />

          <select
            className="field"
            onChange={(event) => updateFilters({ roomType: event.target.value })}
            value={filters.roomType}
          >
            <option value="">Room type</option>
            {roomTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <input
            className="field"
            onChange={(event) => updateFilters({ maxPrice: event.target.value })}
            placeholder="Max price (GHS)"
            type="number"
            value={filters.maxPrice}
          />

          <select
            className="field"
            onChange={(event) =>
              updateFilters({
                amenities: event.target.value ? [event.target.value] : [],
              })
            }
            value={filters.amenities[0] || ''}
          >
            <option value="">Amenity</option>
            {amenityCatalog.map((amenity) => (
              <option key={amenity} value={amenity}>
                {amenity}
              </option>
            ))}
          </select>

          <button className="action-button-primary justify-center" type="button">
            Search
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredRooms.map((room) => (
          <RoomCard
            isFavorite={favorites.includes(room.id)}
            key={room.id}
            onToggleFavorite={(roomId) => {
              if (isAuthenticated) {
                toggleFavorite(roomId)
              }
            }}
            room={room}
          />
        ))}
      </section>
    </AppShell>
  )
}

export default SearchRoomsPage
