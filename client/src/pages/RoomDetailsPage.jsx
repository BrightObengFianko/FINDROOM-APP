import { Heart, Mail, MapPin, ShieldCheck, Star } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import StatusBadge from '../components/common/StatusBadge'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, formatDate } from '../utils/format'

const formatRoomLocation = (room) => [...new Set([room.area, room.location].filter(Boolean))].join(', ')

function RoomDetailsPage() {
  const navigate = useNavigate()
  const { roomId } = useParams()
  const { favorites, rooms, sendMessage, toggleFavorite, userMap } = useAppData()
  const { isAuthenticated } = useAuth()
  const room = rooms.find((candidate) => candidate.id === roomId)
  const [selectedImage, setSelectedImage] = useState(null)

  if (!room) {
    return (
      <div className="section-card text-center">
        <p className="page-title">Room not found</p>
      </div>
    )
  }

  const landlord = userMap[room.landlordId]
  const displayImage = room.images.includes(selectedImage) ? selectedImage : room.images[0]
  const isFavorite = favorites.includes(room.id)
  const canBook = room.status === 'approved'

  const requireAuth = (callback) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/rooms/${room.id}` } })
      return
    }
    callback()
  }

  return (
    <AppShell
      title="Room Details"
      subtitle="Review photos, amenities, landlord info, and booking details."
      actions={
        <Link className="action-button-secondary" to="/rooms">
          Back to search
        </Link>
      }
    >
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.55fr]">
        <article className="section-card">
          <div className="overflow-hidden rounded-[20px] bg-slate-100">
            <img
              alt={room.title}
              className="h-[300px] w-full object-cover sm:h-[420px]"
              src={displayImage}
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            {room.images.map((image) => (
              <button
                className={`overflow-hidden rounded-[18px] border ${
                  displayImage === image ? 'border-brand-400' : 'border-slate-200'
                }`}
                key={image}
                onClick={() => setSelectedImage(image)}
                type="button"
              >
                <img alt={room.title} className="h-20 w-full object-cover" src={image} />
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StatusBadge status={room.status} />
            <span className="pill">
              <MapPin className="mr-2" size={14} />
              {formatRoomLocation(room)}
            </span>
            <span className="pill">
              <Star className="mr-2 text-amber-400" fill="currentColor" size={14} />
              {room.rating}
            </span>
          </div>

          <div className="mt-5">
            <h2 className="text-2xl font-extrabold text-ink">{room.title}</h2>
            <p className="mt-2 text-lg font-bold text-brand-600">{formatCurrency(room.price)} / month</p>
            <p className="mt-3 text-sm leading-6 text-slate-500">{room.description}</p>
          </div>

          <div className="mt-6">
            <p className="font-semibold text-ink">Features</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {room.amenities.map((amenity) => (
                <span className="pill" key={amenity}>
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </article>

        <aside className="space-y-4">
          <article className="section-card">
            <img
              alt={landlord?.name}
              className="h-14 w-14 rounded-2xl object-cover"
              src={landlord?.avatar}
            />
            <p className="mt-4 text-lg font-extrabold text-ink">{room.landlordName}</p>
            <p className="mt-1 text-sm text-slate-500">Verified landlord</p>
            <p className="mt-3 text-sm leading-6 text-slate-500">{landlord?.bio}</p>

            <button
              className="action-button-primary mt-5 w-full justify-center"
              onClick={() =>
                requireAuth(async () => {
                  await sendMessage({
                    roomId: room.id,
                    recipientId: room.landlordId,
                    text: `Hello ${landlord?.name?.split(' ')[0] || 'there'}, I would like to ask about ${room.title}.`,
                  })
                  navigate('/messages')
                })
              }
              type="button"
            >
              <Mail size={16} />
              Send Message
            </button>
          </article>

          <article className="section-card">
            <p className="font-semibold text-ink">Book this room</p>
            <div className="mt-4 space-y-3 rounded-[18px] bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">Move-in date</span>
                <span className="font-semibold text-ink">{formatDate(room.availableFrom)}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">Room type</span>
                <span className="font-semibold text-ink">{room.roomType}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">Price</span>
                <span className="font-semibold text-ink">{formatCurrency(room.price)}</span>
              </div>
            </div>

            {canBook ? (
              <Link className="action-button-primary mt-5 w-full justify-center" to={`/rooms/${room.id}/book`}>
                Book now
              </Link>
            ) : (
              <button
                aria-disabled="true"
                className="action-button-primary mt-5 w-full cursor-not-allowed justify-center opacity-60"
                disabled
                type="button"
              >
                Booking unavailable
              </button>
            )}

            <button
              className="action-button-secondary mt-3 w-full justify-center"
              onClick={() => requireAuth(() => toggleFavorite(room.id))}
              type="button"
            >
              <Heart fill={isFavorite ? 'currentColor' : 'none'} size={16} />
              {isFavorite ? 'Saved to favorites' : 'Save to favorites'}
            </button>

            <div className="mt-5 rounded-[18px] bg-brand-50 p-4 text-sm text-slate-600">
              <p className="flex items-center gap-2 font-semibold text-brand-700">
                <ShieldCheck size={16} />
                Booking protection
              </p>
              <p className="mt-2">
                {canBook
                  ? 'Room requests and payments stay visible in your dashboard after booking.'
                  : 'This listing must be approved before guests can continue to checkout.'}
              </p>
            </div>
          </article>
        </aside>
      </section>
    </AppShell>
  )
}

export default RoomDetailsPage
