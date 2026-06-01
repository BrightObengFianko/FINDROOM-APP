import {
  BarChart3,
  BadgePlus,
  Building2,
  CalendarDays,
  CreditCard,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Settings,
  Shield,
  UserRound,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAppData } from '../../context/AppDataContext'
import { useAuth } from '../../context/AuthContext'
import {
  getLandlordVerificationRedirect,
  getLandlordVerificationStatus,
} from '../../utils/landlordVerification'

const baseItemClass =
  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition'

const activeClass = ({ isActive }) =>
  `${baseItemClass} ${
    isActive
      ? 'bg-brand-50 text-brand-700'
      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
  }`

function AppShell({ title, subtitle, actions, children, headerClassName = 'px-0 py-0' }) {
  const location = useLocation()
  const { favorites } = useAppData()
  const { isAuthenticated, logout, user } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const landlordVerificationStatus =
    user?.role === 'landlord' ? getLandlordVerificationStatus(user) : 'approved'
  const landlordVerificationHref = getLandlordVerificationRedirect(
    user,
    '/landlord/verification',
  )
  const landlordAccessApproved =
    user?.role !== 'landlord' || landlordVerificationStatus === 'approved'

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  const handleSidebarToggle = () => {
    setIsSidebarOpen((current) => !current)
  }

  const handleSidebarClose = () => {
    setIsSidebarOpen(false)
  }

  const handleLogout = () => {
    handleSidebarClose()
    logout()
  }

  const navItems = !isAuthenticated
    ? [
        { to: '/', label: 'Home', icon: Home },
        { to: '/rooms', label: 'Search Rooms', icon: Search },
        { to: '/login', label: 'Login', icon: UserRound },
      ]
    : user?.role === 'admin'
    ? [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin/users', label: 'Users', icon: Users },
        { to: '/admin/landlords', label: 'Landlords', icon: Shield },
        { to: '/admin/listings', label: 'Listings', icon: Building2 },
        { to: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
        { to: '/admin/messages', label: 'Messages', icon: MessageCircle },
        { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
        { to: '/admin/settings', label: 'Settings', icon: Settings },
      ]
    : user?.role === 'landlord' && landlordAccessApproved
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/landlord/listings/new', label: 'Add Listing', icon: BadgePlus },
        { to: '/landlord/listings', label: 'My Listings', icon: Building2 },
        { to: '/bookings', label: 'Bookings', icon: CalendarDays },
        { to: '/messages', label: 'Messages', icon: MessageCircle },
        { to: '/earnings', label: 'Earnings', icon: WalletCards },
        { to: '/profile', label: 'Profile', icon: UserRound },
      ]
    : user?.role === 'landlord'
    ? [
        {
          to: landlordVerificationHref,
          label:
            landlordVerificationStatus === 'pending'
              ? 'Verification Status'
              : landlordVerificationStatus === 'rejected'
                ? 'Update Verification'
                : 'Complete Verification',
          icon: Shield,
        },
        { to: '/profile', label: 'Profile', icon: UserRound },
      ]
    : [
        { to: '/dashboard', label: 'Dashboard', icon: Home },
        { to: '/rooms', label: 'Search Rooms', icon: Search },
        { to: '/bookings', label: 'My Bookings', icon: LayoutDashboard },
        { to: '/messages', label: 'Messages', icon: MessageCircle },
        { to: '/payments', label: 'Payments', icon: CreditCard },
        { to: '/favorites', label: `Favorites${favorites.length ? ` (${favorites.length})` : ''}`, icon: Heart },
        { to: '/profile', label: 'Profile', icon: UserRound },
      ]

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <div
        aria-hidden={!isSidebarOpen}
        className={`fixed inset-0 z-30 bg-slate-950/20 transition-opacity duration-300 lg:hidden ${
          isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={handleSidebarClose}
      />

      <aside
        className={`panel fixed inset-y-0 left-0 z-40 h-full w-[280px] max-w-[calc(100vw-1rem)] overflow-y-auto p-4 transition-transform duration-300 ease-out lg:bottom-auto lg:left-auto lg:sticky lg:top-6 lg:z-auto lg:h-fit lg:w-auto lg:max-w-none lg:translate-x-0 lg:overflow-visible ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavLink className="flex items-center gap-2 px-2 py-1" to="/">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Home size={18} />
          </div>
          <div>
            <p className="font-display text-lg font-extrabold text-ink">FindRoom</p>
            <p className="text-xs text-slate-400">Room rental platform</p>
          </div>
        </NavLink>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink className={activeClass} key={item.to} onClick={handleSidebarClose} to={item.to}>
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}

          {isAuthenticated ? (
            <button
              className={`${baseItemClass} w-full text-slate-500 hover:bg-slate-50 hover:text-slate-700`}
              onClick={handleLogout}
              type="button"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          ) : null}
        </nav>

        <div className="mt-6 rounded-2xl bg-brand-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
            {user?.role === 'admin'
              ? 'Admin tools'
              : user?.role === 'landlord'
                ? landlordAccessApproved
                  ? 'Host tools'
                  : 'Verification'
                : 'Need a room?'}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-700">
            {user?.role === 'admin'
              ? 'Review users, listings, bookings, and reports from one control center.'
              : user?.role === 'landlord' && landlordAccessApproved
              ? 'List your property and manage requests faster.'
              : user?.role === 'landlord'
                ? 'Complete your document review before the landlord workspace unlocks.'
              : isAuthenticated
                ? 'Use filters, favorites, and quick bookings from one place.'
                : 'Create an account to save favorites and track bookings.'}
          </p>
          {user?.role === 'admin' ? (
            <NavLink className="action-button-primary mt-4 w-full justify-center" to="/admin/reports">
              Open Reports
            </NavLink>
          ) : user?.role === 'landlord' && landlordAccessApproved ? (
            <NavLink
              className="action-button-primary mt-4 w-full justify-center"
              to="/landlord/listings/new"
            >
              List Property
            </NavLink>
          ) : user?.role === 'landlord' ? (
            <NavLink className="action-button-primary mt-4 w-full justify-center" to={landlordVerificationHref}>
              {landlordVerificationStatus === 'pending' ? 'Check Status' : 'Verify Account'}
            </NavLink>
          ) : !isAuthenticated ? (
            <NavLink className="action-button-primary mt-4 w-full justify-center" to="/signup">
              Sign up
            </NavLink>
          ) : (
            <NavLink className="action-button-primary mt-4 w-full justify-center" to="/rooms">
              Browse Rooms
            </NavLink>
          )}
        </div>
      </aside>

      <div className="space-y-4">
        <section
          className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${headerClassName}`}
        >
          <div className="flex items-start gap-3">
            <button
              aria-expanded={isSidebarOpen}
              aria-label={isSidebarOpen ? 'Close dashboard menu' : 'Open dashboard menu'}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-700 lg:hidden"
              onClick={handleSidebarToggle}
              type="button"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <div>
              <h1 className="page-title">{title}</h1>
              {subtitle ? <p className="app-muted mt-1">{subtitle}</p> : null}
            </div>
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </section>

        {children}
      </div>
    </div>
  )
}

export default AppShell
