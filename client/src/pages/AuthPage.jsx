import { Lock, Mail, UserRound } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getLandlordVerificationRedirect } from '../utils/landlordVerification'

const signupRoleOptions = ['user', 'landlord']
const loginRoleOptions = ['user', 'landlord', 'admin']
const roleCopy = {
  user: {
    label: 'Tenant',
    description: 'I am looking for a room to rent.',
  },
  landlord: {
    label: 'Landlord',
    description: 'I want to list my property.',
  },
  admin: {
    label: 'Admin',
    description: 'I manage the platform and reviews.',
  },
}

function AuthPage({ mode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, login, signup, user } = useAuth()
  const isSignup = mode === 'signup'
  const availableRoleOptions = isSignup ? signupRoleOptions : loginRoleOptions
  const preferredRole = availableRoleOptions.includes(location.state?.preferredRole)
    ? location.state.preferredRole
    : 'user'
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: preferredRole,
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const from = location.state?.from || '/dashboard'

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getLandlordVerificationRedirect(user, from), { replace: true })
    }
  }, [from, isAuthenticated, navigate, user])

  useEffect(() => {
    setForm((current) =>
      current.role === preferredRole ? current : { ...current, role: preferredRole },
    )
  }, [preferredRole])

  const title = useMemo(
    () => (isSignup ? 'Create your account' : 'Welcome back!'),
    [isSignup],
  )
  const heroTitle = isSignup
    ? 'Find the perfect room, or list your space with ease.'
    : 'Pick up where you left off and manage your room journey smoothly.'
  const heroDescription = isSignup
    ? 'Join thousands of people finding and renting amazing places through a clear tenant and landlord journey.'
    : 'Access your dashboard, messages, listings, and bookings from one calm and consistent workspace.'

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      let session

      if (isSignup) {
        session = await signup(form)
      } else {
        session = await login(form)
      }
      navigate(getLandlordVerificationRedirect(session.user, from), { replace: true })
    } catch (submissionError) {
      setError(submissionError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className={`grid w-full gap-4 lg:min-h-[min(660px,calc(100dvh-1rem))] lg:items-stretch xl:gap-5 ${
        isSignup
          ? 'max-w-[1280px] lg:grid-cols-[minmax(0,1fr)_minmax(410px,30vw)] xl:grid-cols-[minmax(0,1fr)_minmax(430px,30vw)]'
          : 'max-w-[1280px] lg:grid-cols-[minmax(0,1fr)_minmax(400px,30vw)] xl:grid-cols-[minmax(0,1fr)_minmax(420px,30vw)]'
      }`}
    >
      <section className="panel hidden h-full overflow-hidden lg:block">
        <div className="flex h-full flex-col justify-between bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_42%),linear-gradient(180deg,_#ffffff_0%,_#f3f7ff_100%)] p-6 xl:p-7">
          <Link className="inline-flex items-center gap-2" to="/">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <UserRound size={18} />
            </div>
            <span className="font-display text-xl font-extrabold text-ink">findroom</span>
          </Link>

          <div className="max-w-sm">
            <h2 className="text-[2rem] font-extrabold leading-tight text-ink xl:text-[2.35rem]">
              {heroTitle}
            </h2>
            <p className="mt-3 max-w-[30rem] text-[13px] leading-6 text-slate-500 xl:text-[15px] xl:leading-7">
              {heroDescription}
            </p>
          </div>

          <div className="relative h-44 overflow-hidden rounded-[26px] border border-white/70 bg-white/80 p-4 shadow-[0_28px_90px_rgba(15,23,42,0.08)] xl:h-52 xl:p-5">
            <div className="absolute -right-10 top-4 h-28 w-28 rounded-full bg-brand-100/80 blur-2xl" />
            <div className="absolute left-6 top-8 h-24 w-20 rounded-t-[24px] rounded-b-lg bg-sky-100 shadow-sm" />
            <div className="absolute left-24 top-16 h-32 w-24 rounded-t-[28px] rounded-b-xl bg-brand-200 shadow-sm" />
            <div className="absolute left-44 top-6 h-20 w-16 rounded-t-[18px] rounded-b-lg bg-emerald-100 shadow-sm" />
            <div className="absolute bottom-10 left-0 right-0 h-16 bg-[linear-gradient(180deg,rgba(219,234,254,0),rgba(191,219,254,0.9))]" />
            <div className="absolute bottom-4 left-5 flex items-end gap-3 xl:bottom-5 xl:left-6 xl:gap-4">
              <div className="rounded-[16px] border border-slate-200 bg-white px-3 py-2 shadow-sm xl:px-3.5 xl:py-2.5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Verified
                </p>
                <p className="mt-1 font-semibold text-ink">Trusted listings</p>
              </div>
              <div className="rounded-[16px] border border-slate-200 bg-white px-3 py-2 shadow-sm xl:px-3.5 xl:py-2.5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Faster
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {isSignup ? 'Landlord onboarding' : 'Account access'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`panel mx-auto w-full p-5 sm:p-6 lg:flex lg:h-full lg:max-w-none lg:flex-col lg:justify-start lg:p-5 xl:p-6 ${
          isSignup ? 'max-w-[500px] xl:p-7' : 'max-w-[440px]'
        }`}
      >
        <div className={`mb-4 lg:mb-3 ${isSignup ? 'text-left' : 'text-center lg:text-left'}`}>
          {!isSignup ? (
            <Link className="inline-flex items-center gap-2" to="/">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <UserRound size={18} />
              </div>
              <span className="font-display text-xl font-extrabold text-ink">FindRoom</span>
            </Link>
          ) : null}
          <h1
            className={`mt-4 font-extrabold leading-tight text-ink lg:mt-3 ${
              isSignup ? 'text-[1.65rem]' : 'text-[1.85rem]'
            }`}
          >
            {isSignup ? 'Create Account' : title}
          </h1>
          {!isSignup ? <p className="mt-1.5 text-[13px] text-slate-500">Login to continue</p> : null}
        </div>

        {!isSignup ? (
          <div className="space-y-2">
            <button className="action-button-secondary w-full justify-center" type="button">
              <Mail size={16} />
              Continue with Google
            </button>
          </div>
        ) : null}

        <form className={`${isSignup ? 'space-y-3' : 'mt-4 space-y-3 lg:mt-3.5'}`} onSubmit={handleSubmit}>
          {isSignup ? (
            <label className="block text-sm font-semibold text-slate-600">
              Full Name
              <div className="relative mt-2">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  className="field pl-11"
                  onChange={(event) => handleChange('name', event.target.value)}
                  placeholder="Enter your full name"
                  required
                  value={form.name}
                />
              </div>
            </label>
          ) : null}

          <label className="block text-sm font-semibold text-slate-600">
            {isSignup ? 'Email Address' : 'Email'}
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

          <label className="block text-sm font-semibold text-slate-600">
            Password
            <div className="relative mt-2">
              <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                className="field pl-11"
                onChange={(event) => handleChange('password', event.target.value)}
                placeholder={isSignup ? 'Create a password' : 'Enter your password'}
                required
                type="password"
                value={form.password}
              />
            </div>
          </label>

          <div>
            <p className="text-sm font-semibold text-slate-600">{isSignup ? 'I am a:' : 'Role'}</p>
            {isSignup ? (
              <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                {availableRoleOptions.map((role) => {
                  const selected = form.role === role

                  return (
                    <button
                      className={`rounded-[16px] border p-3 text-left transition xl:p-3.5 ${
                        selected
                          ? 'border-brand-500 bg-brand-50 shadow-[0_14px_40px_rgba(37,99,235,0.12)]'
                          : 'border-slate-200 bg-white hover:border-brand-200'
                      }`}
                      key={role}
                      onClick={() => handleChange('role', role)}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold capitalize text-ink">{roleCopy[role].label}</p>
                          <p className="mt-1.5 text-[12px] leading-5 text-slate-500 xl:text-[13px] xl:leading-5">
                            {roleCopy[role].description}
                          </p>
                        </div>
                        <span
                          className={`mt-1 grid h-5 w-5 place-items-center rounded-full border ${
                            selected ? 'border-brand-500 bg-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {selected ? <span className="h-2.5 w-2.5 rounded-full bg-brand-500" /> : null}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="mt-2 flex flex-wrap gap-2">
                {availableRoleOptions.map((role) => (
                  <button
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                      form.role === role
                        ? 'bg-brand-500 text-white'
                        : 'border border-slate-200 bg-white text-slate-600'
                    }`}
                    key={role}
                    onClick={() => handleChange('role', role)}
                    type="button"
                  >
                    {roleCopy[role].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error ? (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <button className="action-button-primary w-full justify-center" disabled={submitting} type="submit">
            {submitting ? 'Please wait...' : isSignup ? 'Create Account' : 'Log in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500 lg:text-left">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <Link className="font-semibold text-brand-600" to={isSignup ? '/login' : '/signup'}>
            {isSignup ? 'Log in' : 'Sign up'}
          </Link>
        </p>
      </section>
    </div>
  )
}

export default AuthPage
