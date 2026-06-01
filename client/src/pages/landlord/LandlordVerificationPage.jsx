import {
  ArrowLeft,
  BadgeCheck,
  AlertTriangle,
  Phone,
  Upload,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  getLandlordVerificationStatus,
  landlordVerificationSteps,
} from '../../utils/landlordVerification'

const MAX_STORED_DOCUMENT_PREVIEW_BYTES = 450000

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const buildStoredDocument = async (file, savedDocument = {}) => {
  if (!file) {
    return {
      name: savedDocument.name || '',
      url: savedDocument.url || '',
      mimeType: savedDocument.mimeType || '',
      size: savedDocument.size || 0,
    }
  }

  let previewUrl = ''

  if (file.size <= MAX_STORED_DOCUMENT_PREVIEW_BYTES) {
    try {
      previewUrl = await fileToDataUrl(file)
    } catch {
      previewUrl = ''
    }
  }

  return {
    name: file.name,
    url: previewUrl,
    mimeType: file.type || '',
    size: file.size || 0,
  }
}

const getNextStep = ({
  identityDocumentName,
  propertyAgreementDocumentName,
  utilityBillDocumentName,
  otpVerified,
}) => {
  if (!identityDocumentName) {
    return 1
  }

  if (!utilityBillDocumentName || !propertyAgreementDocumentName) {
    return 2
  }

  if (!otpVerified) {
    return 3
  }

  return 3
}

const normalizePhoneNumber = (value = '') => String(value).replace(/\D/g, '').slice(0, 10)
const isValidPhoneNumber = (value = '') => /^\d{10}$/.test(value)
const generateOtpCode = () => String(Math.floor(1000 + Math.random() * 9000))

function LandlordVerificationPage() {
  const navigate = useNavigate()
  const { user, updateSessionUser } = useAuth()
  const verificationStatus = getLandlordVerificationStatus(user)
  const savedVerification = user?.landlordVerification || {}
  const [identityDocument, setIdentityDocument] = useState(null)
  const [utilityBillDocument, setUtilityBillDocument] = useState(null)
  const [propertyAgreementDocument, setPropertyAgreementDocument] = useState(null)
  const [phone, setPhone] = useState(normalizePhoneNumber(savedVerification.phone || ''))
  const [otp, setOtp] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(Boolean(savedVerification.otpVerified))
  const [otpStatus, setOtpStatus] = useState(
    savedVerification.otpVerified
      ? 'Phone number verified successfully.'
      : '',
  )
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const identityDocumentName = identityDocument?.name || savedVerification.identityDocumentName || ''
  const utilityBillDocumentName =
    utilityBillDocument?.name || savedVerification.utilityBillDocumentName || ''
  const propertyAgreementDocumentName =
    propertyAgreementDocument?.name ||
    savedVerification.propertyAgreementDocumentName ||
    savedVerification.propertyDocumentName ||
    ''
  const currentStep = useMemo(
    () =>
      getNextStep({
        identityDocumentName,
        propertyAgreementDocumentName,
        utilityBillDocumentName,
        otpVerified,
      }),
    [identityDocumentName, otpVerified, propertyAgreementDocumentName, utilityBillDocumentName],
  )

  if (!user) {
    return <Navigate replace state={{ from: '/landlord/verification' }} to="/login" />
  }

  if (user.role !== 'landlord') {
    return <Navigate replace to="/dashboard" />
  }

  if (verificationStatus === 'approved') {
    return <Navigate replace to="/dashboard" />
  }

  if (verificationStatus === 'pending') {
    return <Navigate replace to="/landlord/verification/submitted" />
  }

  const handleFileSelection = (event, setDocument) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setDocument(file)
    setError('')
  }

  const handleSendOtp = () => {
    if (!phone) {
      setError('Enter your phone number before requesting an OTP.')
      return
    }

    if (!isValidPhoneNumber(phone)) {
      setError('Enter a valid 10-digit phone number before requesting an OTP.')
      return
    }

    const nextOtpCode = generateOtpCode()
    setOtpCode(nextOtpCode)
    setOtp('')
    setOtpSent(true)
    setOtpVerified(false)
    setOtpStatus(`Demo OTP sent to ${phone}: ${nextOtpCode}`)
    setError('')
  }

  const handleVerifyOtp = () => {
    if (!otpSent) {
      setError('Send an OTP code first.')
      return
    }

    if (!/^\d{4}$/.test(otp.trim())) {
      setError('Enter the 4-digit code sent to your phone.')
      return
    }

    if (otp.trim() !== otpCode) {
      setError('The OTP code you entered is incorrect.')
      setOtpVerified(false)
      setOtpStatus('')
      return
    }

    setOtpVerified(true)
    setOtpStatus('Phone number verified successfully.')
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!identityDocumentName || !utilityBillDocumentName || !propertyAgreementDocumentName) {
      setError('Upload your identity document, utility bill, and property agreement before continuing.')
      return
    }

    if (!phone.trim()) {
      setError('Enter the phone number you want us to verify.')
      return
    }

    if (!otpVerified) {
      setError('Verify your phone number with the OTP code before submitting.')
      return
    }

    setIsSubmitting(true)

    const submittedAt = new Date().toISOString()

    try {
      const [storedIdentityDocument, storedUtilityBillDocument, storedPropertyAgreementDocument] =
        await Promise.all([
          buildStoredDocument(identityDocument, {
            name: savedVerification.identityDocumentName,
            url: savedVerification.identityDocumentUrl,
            mimeType: savedVerification.identityDocumentType,
            size: savedVerification.identityDocumentSize,
          }),
          buildStoredDocument(utilityBillDocument, {
            name: savedVerification.utilityBillDocumentName,
            url: savedVerification.utilityBillDocumentUrl,
            mimeType: savedVerification.utilityBillDocumentType,
            size: savedVerification.utilityBillDocumentSize,
          }),
          buildStoredDocument(propertyAgreementDocument, {
            name:
              savedVerification.propertyAgreementDocumentName ||
              savedVerification.propertyDocumentName,
            url:
              savedVerification.propertyAgreementDocumentUrl ||
              savedVerification.propertyDocumentUrl,
            mimeType:
              savedVerification.propertyAgreementDocumentType ||
              savedVerification.propertyDocumentType,
            size:
              savedVerification.propertyAgreementDocumentSize ||
              savedVerification.propertyDocumentSize,
          }),
        ])

      updateSessionUser({
        landlordVerificationStatus: 'pending',
        landlordVerificationSubmittedAt: submittedAt,
        landlordVerificationReviewedAt: '',
        landlordVerification: {
          identityDocumentName: storedIdentityDocument.name,
          identityDocumentUrl: storedIdentityDocument.url,
          identityDocumentType: storedIdentityDocument.mimeType,
          identityDocumentSize: storedIdentityDocument.size,
          utilityBillDocumentName: storedUtilityBillDocument.name,
          utilityBillDocumentUrl: storedUtilityBillDocument.url,
          utilityBillDocumentType: storedUtilityBillDocument.mimeType,
          utilityBillDocumentSize: storedUtilityBillDocument.size,
          propertyAgreementDocumentName: storedPropertyAgreementDocument.name,
          propertyAgreementDocumentUrl: storedPropertyAgreementDocument.url,
          propertyAgreementDocumentType: storedPropertyAgreementDocument.mimeType,
          propertyAgreementDocumentSize: storedPropertyAgreementDocument.size,
          propertyDocumentName: storedPropertyAgreementDocument.name,
          propertyDocumentUrl: storedPropertyAgreementDocument.url,
          propertyDocumentType: storedPropertyAgreementDocument.mimeType,
          propertyDocumentSize: storedPropertyAgreementDocument.size,
          phone: phone.trim(),
          otpVerified: true,
          submittedAt,
        },
      })
      navigate('/landlord/verification/submitted', { replace: true })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid w-full max-w-6xl gap-3 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="panel hidden p-4 lg:flex lg:h-[calc(100dvh-1.5rem)] lg:flex-col">
        <Link className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500" to="/signup">
          <ArrowLeft size={16} />
          Back to account
        </Link>

        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
            Landlord Verification
          </p>
          <h1 className="mt-2 text-[24px] font-extrabold leading-snug text-ink">
            Verify your identity and property ownership.
          </h1>
          <p className="mt-2.5 text-[13px] leading-5 text-slate-500">
            We use this review to keep the platform safe and make landlord listings feel more trustworthy.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {landlordVerificationSteps.map((step) => {
            const isComplete = currentStep > step.number
            const isCurrent = currentStep === step.number

            return (
              <div className="flex gap-3" key={step.number}>
                <div
                  className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-bold ${
                    isComplete
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : isCurrent
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  {isComplete ? <BadgeCheck size={14} /> : step.number}
                </div>
                <div>
                  <p className={`text-[13px] font-semibold leading-5 ${isCurrent ? 'text-ink' : 'text-slate-600'}`}>
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">{step.detail}</p>
                </div>
              </div>
            )
          })}
        </div>
      </aside>

      <section className="panel app-scrollbar overflow-x-hidden overflow-y-visible p-4 sm:p-5 lg:h-[calc(100dvh-1.5rem)] lg:overflow-y-scroll lg:flex lg:flex-col">
        <div className="lg:hidden">
          <Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500" to="/signup">
            <ArrowLeft size={16} />
            Back to account
          </Link>
        </div>

        <div className="mt-2.5 lg:mt-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
            Step {currentStep} of 3
          </p>
          <h2 className="mt-1.5 text-[24px] font-extrabold text-ink">Landlord Verification</h2>
          <p className="mt-1 max-w-2xl text-[13px] leading-5 text-slate-500">
            To keep our community safe, we need to verify your identity and property ownership.
          </p>
        </div>

        {verificationStatus === 'rejected' ? (
          <div
            className="mt-3 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            role="alert"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 shrink-0" size={16} />
              <div>
                <p className="font-semibold">You have been declined.</p>
                <p className="mt-1 leading-5 text-rose-700/90">
                  Update the requested documents below and submit again to return to the review queue.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <form className="mt-3 flex flex-1 flex-col gap-3" onSubmit={handleSubmit}>
          <div className="grid gap-3 md:grid-cols-2">
          <section className="rounded-[20px] border border-slate-100 p-3.5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-ink">Identity Verification</p>
                <p className="mt-0.5 text-[13px] leading-5 text-slate-500">
                  Upload a clear image of your Ghana Card, passport, or other valid ID.
                </p>
              </div>
              <div className="hidden rounded-2xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500 xl:block">
                Example
                <p className="mt-1 font-semibold text-ink">National ID / Passport</p>
              </div>
            </div>

            <label className="mt-2.5 block cursor-pointer rounded-[18px] border border-dashed border-slate-200 bg-slate-50/70 px-3.5 py-3.5 text-center transition hover:border-brand-300 hover:bg-brand-50/40">
              <input
                accept=".png,.jpg,.jpeg,.pdf"
                className="hidden"
                onChange={(event) => handleFileSelection(event, setIdentityDocument)}
                type="file"
              />
              <Upload className="mx-auto text-brand-600" size={20} />
              <p className="mt-2 text-sm font-semibold text-ink">
                {identityDocumentName ? identityDocumentName : 'Click to upload or drag and drop'}
              </p>
              <p className="mt-1 text-xs text-slate-500">PNG, JPG or PDF up to 5MB</p>
            </label>
          </section>

          <section className="rounded-[20px] border border-slate-100 p-3.5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-ink">Property Verification</p>
                <p className="mt-0.5 text-[13px] leading-5 text-slate-500">
                  Upload two documents that show you manage or own the property.
                </p>
              </div>
              <div className="hidden rounded-2xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500 xl:block">
                Example
                <p className="mt-1 font-semibold text-ink">Utility bill + agreement</p>
              </div>
            </div>

            <div className="mt-2.5 grid gap-3 xl:grid-cols-2">
              <label className="block cursor-pointer rounded-[18px] border border-dashed border-slate-200 bg-slate-50/70 px-3.5 py-3.5 text-center transition hover:border-brand-300 hover:bg-brand-50/40">
                <input
                  accept=".png,.jpg,.jpeg,.pdf"
                  className="hidden"
                  onChange={(event) => handleFileSelection(event, setUtilityBillDocument)}
                  type="file"
                />
                <Upload className="mx-auto text-brand-600" size={20} />
                <p className="mt-2 text-sm font-semibold text-ink">
                  {utilityBillDocumentName ? utilityBillDocumentName : 'Upload utility bill'}
                </p>
                <p className="mt-1 text-xs text-slate-500">PNG, JPG or PDF up to 5MB</p>
              </label>

              <label className="block cursor-pointer rounded-[18px] border border-dashed border-slate-200 bg-slate-50/70 px-3.5 py-3.5 text-center transition hover:border-brand-300 hover:bg-brand-50/40">
                <input
                  accept=".png,.jpg,.jpeg,.pdf"
                  className="hidden"
                  onChange={(event) => handleFileSelection(event, setPropertyAgreementDocument)}
                  type="file"
                />
                <Upload className="mx-auto text-brand-600" size={20} />
                <p className="mt-2 text-sm font-semibold text-ink">
                  {propertyAgreementDocumentName
                    ? propertyAgreementDocumentName
                    : 'Upload property agreement'}
                </p>
                <p className="mt-1 text-xs text-slate-500">PNG, JPG or PDF up to 5MB</p>
              </label>
            </div>
          </section>

          <section className="rounded-[20px] border border-slate-100 p-3.5 md:col-span-2">
            <p className="text-sm font-semibold text-ink">Contact Verification</p>
            <p className="mt-0.5 text-[13px] leading-5 text-slate-500">
              We will send a verification code to your phone.
            </p>

            <div className="mt-2.5 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <label className="block">
                <span className="sr-only">Phone number</span>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    className="field pl-11"
                    inputMode="numeric"
                    maxLength={10}
                    onChange={(event) => {
                      const nextPhone = normalizePhoneNumber(event.target.value)

                      setPhone(nextPhone)
                      setOtp('')
                      setOtpCode('')
                      setOtpSent(false)
                      setOtpVerified(false)
                      setOtpStatus('')
                    }}
                    placeholder="Enter your 10-digit phone number"
                    value={phone}
                  />
                </div>
              </label>
              <button
                className="action-button-secondary w-full justify-center sm:w-auto"
                onClick={handleSendOtp}
                type="button"
              >
                {otpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            </div>

            {otpStatus ? (
              <div
                className={`mt-2 rounded-[16px] px-3 py-2 text-xs font-medium ${
                  otpVerified
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-sky-50 text-sky-700'
                }`}
              >
                {otpStatus}
              </div>
            ) : null}

            <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <label className="block">
                <span className="sr-only">Verification code</span>
                <input
                  className="field"
                  inputMode="numeric"
                  maxLength={4}
                  onChange={(event) => {
                    setOtp(event.target.value.replace(/\D/g, '').slice(0, 4))
                    if (otpVerified) {
                      setOtpVerified(false)
                      setOtpStatus('')
                    }
                  }}
                  placeholder="Enter the 4-digit code"
                  value={otp}
                />
              </label>
              <button
                className={`w-full justify-center sm:w-auto ${
                  otpVerified ? 'action-button-primary' : 'action-button-secondary'
                }`}
                onClick={handleVerifyOtp}
                type="button"
              >
                {otpVerified ? 'Verified' : 'Verify OTP'}
              </button>
            </div>
          </section>
          </div>

          {error ? (
            <div className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{error}</div>
          ) : null}

          <div className="mt-auto flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link className="action-button-secondary w-full justify-center sm:w-auto" to="/profile">
              Save for later
            </Link>
            <button className="action-button-primary w-full justify-center sm:w-auto" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Submitting...' : 'Submit verification'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default LandlordVerificationPage
