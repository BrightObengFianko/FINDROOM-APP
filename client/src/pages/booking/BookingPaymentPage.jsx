import { CreditCard, LoaderCircle, Smartphone, Wallet } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { useAppData } from '../../context/AppDataContext'
import { getRoomBookingLockLabel, isRoomBookingLocked } from '../../utils/bookingAvailability'
import {
  clearBookingDraft,
  getBookingReference,
  readBookingDraft,
  writeBookingDraft,
  writeBookingReceipt,
} from '../../utils/bookingFlow'
import { formatCurrency, formatDate } from '../../utils/format'

const mobileMoneyOptions = ['MTN MoMo', 'Telecel Cash', 'AirtelTigo Money']

const formatRoomLocation = (room) =>
  [...new Set([room?.area, room?.location].filter(Boolean))].join(', ')

const createInitialPaymentForm = (draft) => ({
  paymentMethod: draft?.paymentMethod || 'momo',
  mobileMoneyProvider: draft?.mobileMoneyProvider || mobileMoneyOptions[0],
  paymentPhone: draft?.paymentPhone || draft?.phone || '',
  cardNumber: '',
  expiryDate: '',
  cvv: '',
})

function BookingPaymentPage() {
  const navigate = useNavigate()
  const { roomId } = useParams()
  const { bookRoom, rooms, runMockPayment } = useAppData()
  const room = rooms.find((candidate) => candidate.id === roomId)
  const checkoutDraft = useMemo(() => readBookingDraft(roomId), [roomId])
  const [paymentForm, setPaymentForm] = useState(() => createInitialPaymentForm(checkoutDraft))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setPaymentForm(createInitialPaymentForm(checkoutDraft))
  }, [checkoutDraft])

  useEffect(() => {
    if (!checkoutDraft) {
      navigate(`/rooms/${roomId}/book`, { replace: true })
    }
  }, [checkoutDraft, navigate, roomId])

  useEffect(() => {
    if (!checkoutDraft) {
      return
    }

    writeBookingDraft(roomId, {
      ...checkoutDraft,
      paymentMethod: paymentForm.paymentMethod,
      mobileMoneyProvider: paymentForm.mobileMoneyProvider,
      paymentPhone: paymentForm.paymentPhone,
    })
  }, [
    checkoutDraft,
    paymentForm.mobileMoneyProvider,
    paymentForm.paymentMethod,
    paymentForm.paymentPhone,
    roomId,
  ])

  if (!room || !checkoutDraft) {
    return null
  }

  if (room.status !== 'approved') {
    return (
      <AppShell title="Payment unavailable" subtitle="This room is not ready for checkout yet.">
        <section className="section-card text-center">
          <p className="text-base font-semibold text-ink">{room.title} is not available for payment yet.</p>
          <p className="mt-2 app-muted">Return to the booking page and choose another room.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link className="action-button-secondary" to={`/rooms/${room.id}/book`}>
              Back to booking
            </Link>
            <Link className="action-button-primary" to="/rooms">
              Browse rooms
            </Link>
          </div>
        </section>
      </AppShell>
    )
  }

  const isBooked = isRoomBookingLocked(room)

  if (isBooked) {
    return (
      <AppShell title="Payment unavailable" subtitle="This room is already booked.">
        <section className="section-card text-center">
          <p className="text-base font-semibold text-ink">{getRoomBookingLockLabel(room)}.</p>
          <p className="mt-2 app-muted">
            The booking period has not ended yet, so payment cannot continue for a new reservation.
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

  const selectedMethod = paymentForm.paymentMethod
  const isMobileMoney = selectedMethod === 'momo'
  const paymentMethodLabel = isMobileMoney
    ? paymentForm.mobileMoneyProvider
    : 'Bank Card'
  const isPaymentValid = isMobileMoney
    ? Boolean(paymentForm.paymentPhone.trim())
    : Boolean(
        paymentForm.cardNumber.trim() &&
          paymentForm.expiryDate.trim() &&
          paymentForm.cvv.trim(),
      )

  const handlePaymentChange = (field, value) => {
    setPaymentForm((current) => ({ ...current, [field]: value }))
  }

  const handlePayNow = async (event) => {
    event.preventDefault()

    if (!isPaymentValid || submitting) {
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const booking = await bookRoom({
        roomId: room.id,
        startDate: checkoutDraft.checkInDate,
        durationMonths: checkoutDraft.durationMonths,
        duration: checkoutDraft.durationLabel,
        amount: checkoutDraft.totalAmount,
        guestName: checkoutDraft.fullName,
        guestEmail: checkoutDraft.email,
        guestPhone: checkoutDraft.phone,
      })

      if (!booking?.id) {
        throw new Error('We could not create your booking right now.')
      }

      const payment = await runMockPayment({
        bookingId: booking.id,
        amount: checkoutDraft.totalAmount,
        method: paymentMethodLabel,
        paymentChannel: selectedMethod,
        paymentPhone: isMobileMoney ? paymentForm.paymentPhone.trim() : checkoutDraft.phone,
        cardLast4: isMobileMoney ? '' : paymentForm.cardNumber.trim().slice(-4),
        bookingSnapshot: booking,
      })

      if (!payment?.id) {
        throw new Error('We could not complete your payment right now.')
      }

      const receipt = {
        bookingId: booking.id,
        bookingReference: getBookingReference(booking.id),
        paymentId: payment.id,
        roomId: room.id,
        roomTitle: room.title,
        roomLocation: formatRoomLocation(room),
        roomImage: room.images[0],
        amountPaid: payment.amount ?? checkoutDraft.totalAmount,
        bookingStatus: booking.status === 'pending' ? 'approved' : booking.status || 'approved',
        paymentStatus: payment.status || 'successful',
        paymentMethod: payment.method || paymentMethodLabel,
        paidAt: payment.createdAt || new Date().toISOString(),
        checkInDate: booking.startDate || checkoutDraft.checkInDate,
        duration: booking.duration || checkoutDraft.durationLabel,
        tenantName: checkoutDraft.fullName,
        tenantEmail: checkoutDraft.email,
        tenantPhone: checkoutDraft.phone,
      }

      writeBookingReceipt(receipt)
      clearBookingDraft(room.id)
      navigate(`/rooms/${room.id}/book/success?bookingId=${booking.id}`, {
        replace: true,
        state: { receipt },
      })
    } catch (submissionError) {
      setError(submissionError.message || 'Unable to complete payment right now.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell
      title="Payment"
      subtitle="Choose a payment method and finish your booking securely."
      actions={
        <div className="pill border-brand-100 bg-brand-50 text-brand-700">
          Step 2 of 3
        </div>
      }
    >
      <section className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
        <article className="section-card h-fit">
          <p className="text-lg font-bold text-ink">Booking summary</p>

          <div className="mt-5 overflow-hidden rounded-[20px] bg-slate-100">
            <img alt={room.title} className="h-44 w-full object-cover" src={room.images[0]} />
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xl font-extrabold text-ink">{room.title}</p>
              <p className="mt-2 text-sm text-slate-500">{formatRoomLocation(room)}</p>
            </div>

            <div className="rounded-[20px] bg-slate-50 p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Check-in date</span>
                <span className="font-semibold text-ink">{formatDate(checkoutDraft.checkInDate)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-slate-500">Duration</span>
                <span className="font-semibold text-ink">{checkoutDraft.durationLabel}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-slate-500">Guest</span>
                <span className="font-semibold text-ink">{checkoutDraft.fullName}</span>
              </div>
            </div>

            <div className="rounded-[20px] border border-brand-100 bg-brand-50 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">
                Total amount
              </p>
              <p className="mt-2 text-3xl font-extrabold text-ink">
                {formatCurrency(checkoutDraft.totalAmount)}
              </p>
            </div>
          </div>
        </article>

        <form className="section-card" onSubmit={handlePayNow}>
          <p className="text-lg font-bold text-ink">Select payment method</p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <button
              className={`rounded-[20px] border p-4 text-left ${
                isMobileMoney
                  ? 'border-brand-300 bg-brand-50'
                  : 'border-slate-200 bg-white'
              }`}
              onClick={() => handlePaymentChange('paymentMethod', 'momo')}
              type="button"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Smartphone size={18} />
                </span>
                <div>
                  <p className="font-semibold text-ink">Mobile Money</p>
                  <p className="mt-1 text-sm text-slate-500">Pay with your phone number.</p>
                </div>
              </div>
            </button>

            <button
              className={`rounded-[20px] border p-4 text-left ${
                !isMobileMoney
                  ? 'border-brand-300 bg-brand-50'
                  : 'border-slate-200 bg-white'
              }`}
              onClick={() => handlePaymentChange('paymentMethod', 'card')}
              type="button"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-100 text-sky-700">
                  <CreditCard size={18} />
                </span>
                <div>
                  <p className="font-semibold text-ink">Card</p>
                  <p className="mt-1 text-sm text-slate-500">Use a debit or credit card.</p>
                </div>
              </div>
            </button>
          </div>

          {isMobileMoney ? (
            <div className="mt-5 rounded-[22px] bg-slate-50 p-4">
              <label className="block text-sm font-semibold text-slate-600">
                Mobile money provider
                <select
                  className="field mt-2"
                  onChange={(event) => handlePaymentChange('mobileMoneyProvider', event.target.value)}
                  value={paymentForm.mobileMoneyProvider}
                >
                  {mobileMoneyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="mt-4 block text-sm font-semibold text-slate-600">
                Phone number
                <input
                  className="field mt-2"
                  onChange={(event) => handlePaymentChange('paymentPhone', event.target.value)}
                  placeholder="Enter payment phone number"
                  required
                  value={paymentForm.paymentPhone}
                />
              </label>
            </div>
          ) : (
            <div className="mt-5 rounded-[22px] bg-slate-50 p-4">
              <label className="block text-sm font-semibold text-slate-600">
                Card number
                <input
                  className="field mt-2"
                  inputMode="numeric"
                  onChange={(event) => handlePaymentChange('cardNumber', event.target.value)}
                  placeholder="1234 5678 9012 3456"
                  required
                  value={paymentForm.cardNumber}
                />
              </label>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-600">
                  Expiry date
                  <input
                    className="field mt-2"
                    onChange={(event) => handlePaymentChange('expiryDate', event.target.value)}
                    placeholder="MM/YY"
                    required
                    value={paymentForm.expiryDate}
                  />
                </label>

                <label className="block text-sm font-semibold text-slate-600">
                  CVV
                  <input
                    className="field mt-2"
                    inputMode="numeric"
                    onChange={(event) => handlePaymentChange('cvv', event.target.value)}
                    placeholder="123"
                    required
                    value={paymentForm.cvv}
                  />
                </label>
              </div>
            </div>
          )}

          <div className="mt-5 rounded-[22px] border border-slate-100 bg-white p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <Wallet size={16} />
              Payment review
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="text-slate-500">Method</span>
              <span className="font-semibold text-ink">{paymentMethodLabel}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="text-slate-500">Amount due</span>
              <span className="font-semibold text-ink">{formatCurrency(checkoutDraft.totalAmount)}</span>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap justify-between gap-3">
            <Link className="action-button-secondary" to={`/rooms/${room.id}/book`}>
              Back
            </Link>
            <button
              className="action-button-primary min-w-[180px]"
              disabled={!isPaymentValid || submitting}
              type="submit"
            >
              {submitting ? (
                <>
                  <LoaderCircle className="animate-spin" size={16} />
                  Processing...
                </>
              ) : (
                'Pay now'
              )}
            </button>
          </div>
        </form>
      </section>
    </AppShell>
  )
}

export default BookingPaymentPage
