import { Heart, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../../utils/format'

const formatRoomLocation = (room) => [...new Set([room.area, room.location].filter(Boolean))].join(', ')

function RoomCard({ room, isFavorite, onToggleFavorite }) {
  const canBook = room.status === 'approved'

  return (
    <article className="panel overflow-hidden transition duration-200 hover:-translate-y-0.5">
      <div className="relative h-44 bg-slate-100">
        <img
          alt={room.title}
          className="h-full w-full object-cover"
          src={room.images[0]}
        />
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="pill">{room.roomType}</span>
        </div>
        <button
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-slate-600 shadow-sm transition hover:text-rose-500"
          onClick={() => onToggleFavorite?.(room.id)}
          type="button"
        >
          <Heart fill={isFavorite ? 'currentColor' : 'none'} size={16} />
        </button>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-extrabold text-ink">{room.title}</h3>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <MapPin size={14} />
              {formatRoomLocation(room)}
            </p>
          </div>
          <p className="font-display text-lg font-extrabold text-ink">{formatCurrency(room.price)}</p>
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-slate-500">{room.summary}</p>

        <div className="flex flex-wrap gap-2">
          {room.amenities.slice(0, 3).map((amenity) => (
            <span className="pill" key={amenity}>
              {amenity}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Star className="text-amber-400" fill="currentColor" size={16} />
            {room.rating}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            {canBook ? (
              <Link className="action-button-primary px-3 py-2" to={`/rooms/${room.id}/book`}>
                Book now
              </Link>
            ) : (
              <button
                aria-disabled="true"
                className="action-button-primary cursor-not-allowed px-3 py-2 opacity-60"
                disabled
                type="button"
              >
                Unavailable
              </button>
            )}
            <Link className="action-button-secondary px-3 py-2" to={`/rooms/${room.id}`}>
              View details
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

export default RoomCard
