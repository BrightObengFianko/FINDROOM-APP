import { Link } from 'react-router-dom'
import RoomCard from '../components/common/RoomCard'
import AppShell from '../components/layout/AppShell'
import { useAppData } from '../context/AppDataContext'

function FavoritesPage() {
  const { favoriteRooms, favorites, toggleFavorite } = useAppData()

  return (
    <AppShell title="My Favorites" subtitle="Rooms you saved for later comparison.">
      {favoriteRooms.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {favoriteRooms.map((room) => (
            <RoomCard
              isFavorite={favorites.includes(room.id)}
              key={room.id}
              onToggleFavorite={toggleFavorite}
              room={room}
            />
          ))}
        </section>
      ) : (
        <section className="section-card text-center">
          <p className="page-title">No favorite rooms yet</p>
          <p className="mt-2 app-muted">Save rooms from the search page and they will appear here.</p>
          <Link className="action-button-primary mt-5" to="/rooms">
            Browse rooms
          </Link>
        </section>
      )}
    </AppShell>
  )
}

export default FavoritesPage
