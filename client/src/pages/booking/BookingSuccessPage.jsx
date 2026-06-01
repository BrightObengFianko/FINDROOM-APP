import { CheckCircle2, Download, MapPin, ReceiptText } from 'lucide-react'
import { useMemo } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import StatusBadge from '../../components/common/StatusBadge'
import AppShell from '../../components/layout/AppShell'
import { useAppData } from '../../context/AppDataContext'
import { getBookingReference, readBookingReceipt } from '../../utils/bookingFlow'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format'

const formatRoomLocation = (room) =>
  [...new Set([room?.area, room?.location].filter(Boolean))].join(', ')

const buildFallbackReceipt = ({ booking, payment, room }) => {
  if (!booking || !room) {
    return null
  }

  return {
    bookingId: booking.id,
    bookingReference: getBookingReference(booking.id),
    paymentId: payment?.id || '',
    roomId: room.id,
    roomTitle: booking.roomTitle || room.title,
    roomLocation: formatRoomLocation(room),
    roomImage: room.images[0],
    amountPaid: payment?.amount ?? booking.amount,
    bookingStatus: booking.status || 'approved',
    paymentStatus: payment?.status || 'successful',
    paymentMethod: payment?.method || 'Mock payment',
    paidAt: payment?.createdAt || new Date().toISOString(),
    checkInDate: booking.startDate,
    duration: booking.duration,
    tenantName: booking.guestName || '',
    tenantEmail: booking.guestEmail || '',
    tenantPhone: booking.guestPhone || '',
  }
}

function BookingSuccessPage() {
  const location = useLocation()
  const { roomId } = useParams()
  const [searchParams] = useSearchParams()
  const { bookings, payments, rooms } = useAppData()
  const room = rooms.find((candidate) => candidate.id === roomId)
  const bookingId = searchParams.get('bookingId') || location.state?.receipt?.bookingId || ''
  const booking = bookings.find((candidate) => candidate.id === bookingId)
  const payment = payments.find((candidate) => candidate.bookingId === bookingId)
  const receipt = useMemo(
    () =>
      location.state?.receipt ||
      readBookingReceipt(bookingId) ||
      buildFallbackReceipt({ booking, payment, room }),
    [booking, bookingId, location.state?.receipt, payment, room],
  )

  const handleDownloadReceipt = () => {
    if (!receipt) {
      return
    }

    const content = [
      'FindRoom Booking Receipt',
      `Booking Ref: ${receipt.bookingReference}`,
      `Booking ID: ${receipt.bookingId}`,
      `Room: ${receipt.roomTitle}`,
      `Location: ${receipt.roomLocation}`,
      `Amount Paid: ${formatCurrency(receipt.amountPaid)}`,
      `Payment Method: ${receipt.paymentMethod}`,
      `Paid At: ${formatDateTime(receipt.paidAt)}`,
      `Check-in Date: ${formatDate(receipt.checkInDate)}`,
      `Duration: ${receipt.duration}`,
      `Tenant: ${receipt.tenantName}`,
      `Email: ${receipt.tenantEmail}`,
      `Phone: ${receipt.tenantPhone}`,
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const downloadUrl = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = downloadUrl
    anchor.download = `findroom-receipt-${receipt.bookingReference}.txt`
    anchor.click()
    window.URL.revokeObjectURL(downloadUrl)
  }

  if (!receipt || !room) {
    return (
      <AppShell title="Booking confirmation" subtitle="We could not load that receipt right now.">
        <section className="section-card text-center">
          <p className="text-base font-semibold text-ink">Receipt not found</p>
          <p className="mt-2 app-muted">
            Your booking may still be saved in your dashboard. Open your bookings to continue.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link className="action-button-secondary" to="/rooms">
              Search rooms
            </Link>
            <Link className="action-button-primary" to="/bookings">
              Open bookings
            </Link>
          </div>
        </section>
      </AppShell>
    )
  }

  return (
    <AppShell
      title="Payment Successful"
      subtitle="Your room has been booked successfully and the receipt is ready."
      actions={
        <div className="pill border-brand-100 bg-brand-50 text-brand-700">
          Step 3 of 3
        </div>
      }
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <article className="section-card">
          <div className="flex flex-col items-start gap-4 rounded-[24px] bg-[linear-gradient(180deg,#f4fff5_0%,#eaf8ee_100%)] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-brand-600 shadow-sm">
                <CheckCircle2 size={30} />
              </span>
              <div>
                <p className="text-2xl font-extrabold text-ink">Payment successful</p>
                <p className="mt-1 text-sm text-slate-600">
                  Your booking has been confirmed and stored in your account.
                </p>
              </div>
            </div>
            <StatusBadge status={receipt.paymentStatus} />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-[22px] bg-slate-100">
              <img alt={receipt.roomTitle} className="h-full min-h-[180px] w-full object-cover" src={receipt.roomImage} />
            </div>

            <div className="space-y-4 rounded-[22px] border border-slate-100 p-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Room
                </p>
                <p className="mt-2 text-2xl font-extrabold text-ink">{receipt.roomTitle}</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={15} />
                  {receipt.roomLocation}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[18px] bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Amount paid
                  </p>
                  <p className="mt-2 text-xl font-extrabold text-brand-600">
                    {formatCurrency(receipt.amountPaid)}
                  </p>
                </div>
                <div className="rounded-[18px] bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Booking reference
                  </p>
                  <p className="mt-2 text-xl font-extrabold text-ink">{receipt.bookingReference}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <article className="rounded-[22px] border border-slate-100 p-5">
              <p className="text-lg font-bold text-ink">Booking details</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Booking ID</span>
                  <span className="font-semibold text-ink">{receipt.bookingId}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Check-in date</span>
                  <span className="font-semibold text-ink">{formatDate(receipt.checkInDate)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-semibold text-ink">{receipt.duration}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Status</span>
                  <StatusBadge status={receipt.bookingStatus} />
                </div>
              </div>
            </article>

            <article className="rounded-[22px] border border-slate-100 p-5">
              <p className="text-lg font-bold text-ink">Payment details</p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Payment method</span>
                  <span className="font-semibold text-ink">{receipt.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Paid at</span>
                  <span className="font-semibold text-ink">{formatDateTime(receipt.paidAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-500">Receipt status</span>
                  <StatusBadge status={receipt.paymentStatus} />
                </div>
              </div>
            </article>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button className="action-button-secondary" onClick={handleDownloadReceipt} type="button">
              <Download size={16} />
              Download receipt
            </button>
            <Link className="action-button-primary" to="/dashboard">
              Go to dashboard
            </Link>
          </div>
        </article>

        <article className="section-card h-fit">
          <p className="flex items-center gap-2 text-lg font-bold text-ink">
            <ReceiptText size={18} />
            Receipt overview
          </p>

          <div className="mt-5 rounded-[22px] bg-slate-50 p-5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Tenant</span>
              <span className="font-semibold text-ink">{receipt.tenantName}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-slate-500">Email</span>
              <span className="font-semibold text-ink">{receipt.tenantEmail}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-slate-500">Phone</span>
              <span className="font-semibold text-ink">{receipt.tenantPhone}</span>
            </div>
          </div>

          <div className="mt-4 rounded-[22px] border border-brand-100 bg-brand-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">
              Next step
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              You can find this booking later from your dashboard, payments page, and booking history.
            </p>
          </div>
        </article>
      </section>
    </AppShell>
  )
}

export default BookingSuccessPage
