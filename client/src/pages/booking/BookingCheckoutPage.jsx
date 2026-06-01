import { CalendarDays, ChevronRight, Mail, MapPin, Phone, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { useAppData } from '../../context/AppDataContext'
import { useAuth } from '../../context/AuthContext'
import { readBookingDraft, writeBookingDraft, formatDurationLabel, normalizeDurationMonths } from '../../utils/bookingFlow'
import { formatCurrency, formatDate, toDateInputValue } from '../../utils/format'

const durationOptions = [1, 2, 3, 6, 12]

const formatRoomLocation = (room) =>
  [...new Set([room?.area, room?.location].filter(Boolean))].join(', ')

const getEarliestCheckInDate = (value) => {
  const today = toDateInputValue()
  const availableDate = toDateInputValue(value)
  return availableDate > today ? availableDate : today
}

const buildInitialForm = (room, user, draft) => {
  const durationMonths = normalizeDurationMonths(draft?.durationMonths || 1)

  return {
    checkInDate: draft?.checkInDate || getEarliestCheckInDate(room?.availableFrom),
    durationMonths: String(durationMonths),
    fullName: draft?.fullName || user?.name || '',
    phone: draft?.phone || user?.phone || '',
    email: draft?.email || user?.email || '',
  }
}

function BookingCheckoutPage() {
  const navigate = useNavigate()
  const { roomId } = useParams()
  const { rooms } = useAppData()
  const { user } = useAuth()
  const room = rooms.find((candidate) => candidate.id === roomId)
  const savedDraft = useMemo(() => readBookingDraft(roomId), [roomId])
  const [form, setForm] = useState(() => buildInitialForm(room, user, savedDraft))

  useEffect(() => {
    setForm(buildInitialForm(room, user, savedDraft))
  }, [room, savedDraft, user])

  if (!room) {
    return (
      <AppShell title="Booking" subtitle="We could not find that room anymore.">
        <section className="section-card text-center">
          <p className="text-base font-semibold text-ink">Room not found</p>
          <p className="mt-2 app-muted">Choose another listing to continue your booking.</p>
          <Link className="action-button-primary mt-5" to="/rooms">
            Back to search
          </Link>
        </section>
      </AppShell>
    )
  }

  if (room.status !== 'approved') {
    return (
      <AppShell title="Booking unavailable" subtitle="This room is not ready for checkout yet.">
        <section className="section-card text-center">
          <p className="text-base font-semibold text-ink">{room.title} is not available for booking yet.</p>
          <p className="mt-2 app-muted">
            Please choose another approved room or check back after the listing review is complete.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link className="action-button-secondary" to={`/rooms/${room.id}`}>
              View room details
            </Link>
            <Link className="action-button-primary" to="/rooms">
              Browse rooms
            </Link>
          </div>
        </section>
      </AppShell>
    )
  }

  const durationMonths = normalizeDurationMonths(form.durationMonths)
  const totalAmount = room.price * durationMonths
  const minCheckInDate = getEarliestCheckInDate(room.availableFrom)

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const draft = {
      roomId: room.id,
      roomTitle: room.title,
      roomLocation: formatRoomLocation(room),
      roomImage: room.images[0],
      monthlyRent: room.price,
      checkInDate: form.checkInDate,
      durationMonths,
      durationLabel: formatDurationLabel(durationMonths),
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      totalAmount,
      updatedAt: new Date().toISOString(),
    }

    writeBookingDraft(room.id, draft)
    navigate(`/rooms/${room.id}/book/payment`)
  }

  return (
    <AppShell
      title="Booking Summary"
      subtitle="Confirm your stay details before continuing to payment."
      actions={
        <div className="pill border-brand-100 bg-brand-50 text-brand-700">
          Step 1 of 3
        </div>
      }
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_360px]">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <article className="section-card">
            <p className="text-lg font-bold text-ink">Booking details</p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-600">
                Check-in date
                <div className="relative mt-2">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    className="field pl-11"
                    min={minCheckInDate}
                    onChange={(event) => handleChange('checkInDate', event.target.value)}
                    required
                    type="date"
                    value={form.checkInDate}
                  />
                </div>
              </label>

              <label className="block text-sm font-semibold text-slate-600">
                Duration
                <select
                  className="field mt-2"
                  onChange={(event) => handleChange('durationMonths', event.target.value)}
                  value={form.durationMonths}
                >
                  {durationOptions.map((option) => (
                    <option key={option} value={option}>
                      {formatDurationLabel(option)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 rounded-[20px] bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Total cost</p>
                  <p className="mt-1 text-2xl font-extrabold text-ink">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="text-right text-sm text-slate-500">
                  <p>{formatCurrency(room.price)} per month</p>
                  <p className="mt-1">{formatDurationLabel(durationMonths)}</p>
                </div>
              </div>
            </div>
          </article>

          <article className="section-card">
            <p className="text-lg font-bold text-ink">User information</p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold text-slate-600 md:col-span-2">
                Full name
                <div className="relative mt-2">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    className="field pl-11"
                    onChange={(event) => handleChange('fullName', event.target.value)}
                    placeholder="Enter your full name"
                    required
                    value={form.fullName}
                  />
                </div>
              </label>

              <label className="block text-sm font-semibold text-slate-600">
                Phone number
                <div className="relative mt-2">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    className="field pl-11"
                    onChange={(event) => handleChange('phone', event.target.value)}
                    placeholder="Enter your phone number"
                    required
                    value={form.phone}
                  />
                </div>
              </label>

              <label className="block text-sm font-semibold text-slate-600">
                Email address
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    className="field pl-11"
                    onChange={(event) => handleChange('email', event.target.value)}
                    placeholder="Enter your email"
                    required
                    type="email"
                    value={form.email}
                  />
                </div>
              </label>
            </div>
          </article>

          <div className="flex flex-wrap justify-between gap-3">
            <Link className="action-button-secondary" to={`/rooms/${room.id}`}>
              Cancel
            </Link>
            <button className="action-button-primary" type="submit">
              Proceed to payment
              <ChevronRight size={16} />
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <article className="section-card">
            <p className="text-lg font-bold text-ink">Booking summary</p>

            <div className="mt-5 overflow-hidden rounded-[22px] bg-slate-100">
              <img alt={room.title} className="h-52 w-full object-cover" src={room.images[0]} />
            </div>

            <div className="mt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-extrabold text-ink">{room.title}</p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin size={15} />
                    {formatRoomLocation(room)}
                  </p>
                </div>
                <p className="text-lg font-extrabold text-brand-600">{formatCurrency(room.price)}</p>
              </div>

              <div className="mt-5 grid gap-3 rounded-[20px] bg-slate-50 p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Available from</span>
                  <span className="font-semibold text-ink">{formatDate(room.availableFrom)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Move-in date</span>
                  <span className="font-semibold text-ink">{formatDate(form.checkInDate)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-semibold text-ink">{formatDurationLabel(durationMonths)}</span>
                </div>
              </div>
            </div>
          </article>

          <article className="section-card bg-[linear-gradient(180deg,#f8fff8_0%,#eefaf1_100%)]">
            <p className="flex items-center gap-2 text-base font-bold text-brand-700">
              <ShieldCheck size={18} />
              What happens next?
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>Review the booking details and continue to the payment step.</li>
              <li>Complete your payment securely with mobile money or card.</li>
              <li>Your receipt and booking record will appear immediately after success.</li>
            </ul>
          </article>
        </div>
      </section>
    </AppShell>
  )
}

export default BookingCheckoutPage
