import { ArrowLeft, BadgeCheck, Clock3, FileCheck2 } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import StatusBadge from '../../components/common/StatusBadge'
import { useAuth } from '../../context/AuthContext'
import { formatDateTime } from '../../utils/format'
import {
  canCreateLandlordListings,
  getLandlordVerificationDocuments,
  getLandlordVerificationLabel,
  getLandlordVerificationStatus,
} from '../../utils/landlordVerification'

function LandlordVerificationSubmittedPage() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate replace state={{ from: '/landlord/verification/submitted' }} to="/login" />
  }

  if (user.role !== 'landlord') {
    return <Navigate replace to="/dashboard" />
  }

  const verificationStatus = getLandlordVerificationStatus(user)
  const verification = user.landlordVerification || {}
  const verificationDocuments = getLandlordVerificationDocuments(verification)

  if (verificationStatus === 'not_submitted') {
    return <Navigate replace to="/landlord/verification" />
  }

  const isApproved = canCreateLandlordListings(user)
  const isRejected = verificationStatus === 'rejected'
  const primaryActionHref =
    isRejected
      ? '/landlord/verification'
      : isApproved
        ? '/dashboard'
        : '/profile'
  const primaryActionLabel =
    isRejected
      ? 'Update verification'
      : isApproved
        ? 'Go to dashboard'
        : 'Go to profile'
  const heroTitle = isApproved
    ? 'Verification Approved!'
    : isRejected
      ? 'Verification needs updates'
      : 'Verification Submitted!'
  const heroDescription = isApproved
    ? 'Your landlord profile has been approved. Go to your dashboard to continue managing your account.'
    : isRejected
      ? 'Your last landlord review was not approved yet. Update the requested documents and resubmit to unlock the landlord workspace.'
      : 'Thank you for submitting your information. Our team will review your documents and get back to you shortly.'
  const backLinkHref = isApproved ? '/dashboard' : '/profile'
  const backLinkLabel = isApproved ? 'Back to dashboard' : 'Back to profile'

  return (
    <div className="mx-auto flex w-full max-w-6xl items-stretch">
      <section className="panel w-full overflow-hidden p-4 sm:p-5 lg:min-h-[calc(100dvh-1.5rem)] lg:p-5 xl:p-6">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500" to={backLinkHref}>
          <ArrowLeft size={16} />
          {backLinkLabel}
        </Link>

        <div className="mt-4 grid gap-3 lg:min-h-[calc(100dvh-8.5rem)] lg:grid-cols-[minmax(290px,0.84fr)_minmax(0,1.16fr)] lg:gap-4">
          <div
            className={`flex min-h-[160px] flex-col justify-center rounded-[24px] p-5 text-center sm:min-h-[220px] sm:p-6 lg:min-h-0 lg:p-7 ${
              isRejected
                ? 'bg-[radial-gradient(circle_at_top,_rgba(244,63,94,0.12),_transparent_42%),linear-gradient(180deg,_#ffffff_0%,_#fff7f8_100%)]'
                : 'bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.16),_transparent_42%),linear-gradient(180deg,_#ffffff_0%,_#f8fbff_100%)]'
            }`}
          >
            <div
              className={`mx-auto grid h-14 w-14 place-items-center rounded-full sm:h-16 sm:w-16 ${
                isRejected ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <BadgeCheck size={28} />
            </div>
            <h1 className="mt-4 text-[24px] font-extrabold leading-tight text-ink sm:text-[28px] lg:text-[30px]">
              {heroTitle}
            </h1>
            <p className="mx-auto mt-3 max-w-[30rem] text-sm leading-6 text-slate-500 sm:text-[15px]">
              {heroDescription}
            </p>
          </div>

          <div className="flex min-h-0 flex-col gap-3 lg:gap-4">
            <div className={`rounded-[22px] p-4 ${isRejected ? 'bg-rose-50/70' : 'bg-sky-50/70'} sm:p-5`}>
              <p className={`text-sm font-bold ${isRejected ? 'text-rose-700' : 'text-brand-700'}`}>
                What happens next?
              </p>
              <div className="mt-3 grid gap-2.5 min-[380px]:grid-cols-3">
                <div className="rounded-[18px] bg-white/70 p-3">
                  <div className="flex items-center gap-2.5">
                    <Clock3 className={`${isRejected ? 'text-rose-600' : 'text-brand-600'}`} size={17} />
                    <p className="text-sm font-semibold text-slate-700">Review</p>
                  </div>
                  <p className="mt-2 text-[13px] leading-5 text-slate-600">
                    {isRejected
                      ? 'Review the document details below and replace anything the team could not confirm.'
                      : 'We review your documents, usually within 24 to 48 hours.'}
                  </p>
                </div>
                <div className="rounded-[18px] bg-white/70 p-3">
                  <div className="flex items-center gap-2.5">
                    <FileCheck2 className={`${isRejected ? 'text-rose-600' : 'text-brand-600'}`} size={17} />
                    <p className="text-sm font-semibold text-slate-700">Update</p>
                  </div>
                  <p className="mt-2 text-[13px] leading-5 text-slate-600">
                    {isRejected
                      ? 'Submit the updated files again and your verification will return to the pending review queue.'
                      : 'You will get an email and an in-app status update once the review is complete.'}
                  </p>
                </div>
                <div className="rounded-[18px] bg-white/70 p-3">
                  <div className="flex items-center gap-2.5">
                    <BadgeCheck className={`${isRejected ? 'text-rose-600' : 'text-brand-600'}`} size={17} />
                    <p className="text-sm font-semibold text-slate-700">Unlock</p>
                  </div>
                  <p className="mt-2 text-[13px] leading-5 text-slate-600">
                    {isApproved
                      ? 'Your landlord dashboard is unlocked, including listings, bookings, and earnings.'
                      : isRejected
                        ? 'Once the updated submission is approved, the landlord dashboard will unlock automatically.'
                        : 'Once approved, you can start listing your properties and accepting bookings.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid items-start gap-3 min-[380px]:grid-cols-[160px_minmax(0,1fr)] md:grid-cols-[220px_minmax(0,1fr)] lg:gap-4">
              <div className="rounded-[22px] border border-slate-100 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Verification status</p>
                <div className="mt-3">
                  <StatusBadge status={getLandlordVerificationLabel(verificationStatus)} />
                </div>
                <div className="mt-4 space-y-2 text-sm text-slate-500">
                  <div>
                    <p className="font-semibold text-slate-700">Submitted</p>
                    <p className="mt-1">
                      {verification.submittedAt || user.landlordVerificationSubmittedAt
                        ? formatDateTime(verification.submittedAt || user.landlordVerificationSubmittedAt)
                        : 'Not available'}
                    </p>
                  </div>
                  {user.landlordVerificationReviewedAt ? (
                    <div>
                      <p className="font-semibold text-slate-700">Reviewed</p>
                      <p className="mt-1">{formatDateTime(user.landlordVerificationReviewedAt)}</p>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[22px] border border-slate-100 p-4">
                <div className="grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
                  <div>
                    <p className="font-semibold text-slate-700">Phone</p>
                    <p className="mt-1">{verification.phone || 'Not provided'}</p>
                  </div>
                  {verificationDocuments.map((document) => (
                    <div key={document.key}>
                      <p className="font-semibold text-slate-700">{document.label}</p>
                      <p className="mt-1 break-words">{document.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-auto flex pt-1 sm:justify-end">
              <Link
                className="action-button-primary w-full justify-center sm:w-auto sm:min-w-[190px]"
                to={primaryActionHref}
              >
                {primaryActionLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandlordVerificationSubmittedPage
