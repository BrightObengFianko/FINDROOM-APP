import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { navLinks } from '../../data/landingContent'
import useLandlordEntry from '../../hooks/useLandlordEntry'

const sectionOrder = ['home', 'about', 'browse', 'landlords', 'contact']
const navSectionMap = {
  Home: 'home',
  'Browse Rooms': 'browse',
  'For Landlords': 'landlords',
  'About us': 'about',
  'Contact us': 'contact',
}

function Navbar() {
  const location = useLocation()
  const { isAuthenticated, logout, user } = useAuth()
  const handleLandlordEntry = useLandlordEntry()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const navigationLinks =
    user?.role === 'admin' ? [...navLinks, { label: 'Admin', to: '/admin' }] : navLinks

  const handleMenuToggle = () => {
    setIsMenuOpen((current) => !current)
  }

  const handleMenuClose = () => {
    setIsMenuOpen(false)
  }

  const handleLogout = () => {
    handleMenuClose()
    logout()
  }

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname, location.hash])

  useEffect(() => {
    if (location.pathname !== '/') {
      return undefined
    }

    const updateActiveSection = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.35
      let nextSection = 'home'

      sectionOrder.forEach((sectionId) => {
        const section = document.getElementById(sectionId)

        if (section && scrollPosition >= section.offsetTop) {
          nextSection = sectionId
        }
      })

      setActiveSection(nextSection)
    }

    const frameId = window.requestAnimationFrame(updateActiveSection)

    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [location.pathname, location.hash])

  const renderNavItem = (link) => {
    const targetSection = navSectionMap[link.label]
    const isActive = link.to
      ? location.pathname === link.to || (location.pathname === '/' && activeSection === targetSection)
      : location.pathname === '/' && activeSection === targetSection
    const itemClassName = `relative inline-flex w-fit after:absolute after:-bottom-[6px] after:left-0 after:h-[2px] after:w-full after:origin-left after:bg-brand-500 after:transition-all after:duration-300 after:ease-out after:content-[''] ${isActive ? 'after:scale-x-100 after:opacity-100' : 'after:scale-x-0 after:opacity-0'}`

    if (link.label === 'For Landlords') {
      return (
        <button
          aria-current={isActive ? 'page' : undefined}
          className={itemClassName}
          key={link.label}
          onClick={() => {
            handleMenuClose()
            handleLandlordEntry()
          }}
          type="button"
        >
          {link.label}
        </button>
      )
    }

    if (link.to) {
      return (
        <Link
          aria-current={isActive ? 'page' : undefined}
          className={itemClassName}
          key={link.label}
          onClick={handleMenuClose}
          to={link.to}
        >
          {link.label}
        </Link>
      )
    }

    return (
      <a
        aria-current={isActive ? 'page' : undefined}
        className={itemClassName}
        href={link.href}
        key={link.label}
        onClick={handleMenuClose}
      >
        {link.label}
      </a>
    )
  }

  return (
    <header className="fixed left-1/2 top-0 z-40 flex w-[calc(100%-2rem)] max-w-[1160px] -translate-x-1/2 items-start justify-between border-b border-[#e8edf3] bg-white px-4 py-4 sm:w-[calc(100%-2.5rem)] sm:px-5 sm:py-5 lg:h-[69px] lg:w-[calc(100%-3rem)] lg:flex-row lg:items-center lg:justify-between lg:px-[24px] lg:py-0">
      <Link className="block text-[21px] font-black uppercase tracking-[0.055em] text-[#0f1728] sm:text-[23px]" to="/">
        FindRoom
      </Link>

      <button
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        className="button-interactive inline-flex h-[36px] w-[36px] items-center justify-center rounded-[7px] border border-[#d9e2ec] bg-white text-[#1f2937] lg:hidden"
        onClick={handleMenuToggle}
        type="button"
      >
        {isMenuOpen ? <X size={18} strokeWidth={2.2} /> : <Menu size={18} strokeWidth={2.2} />}
      </button>

      <nav className="hidden w-full flex-wrap items-center gap-x-6 gap-y-3 text-[12px] font-medium text-[#0f1728] sm:gap-x-8 lg:flex lg:w-auto lg:gap-[43px] lg:pl-[44px]">
        {navigationLinks.map(renderNavItem)}
      </nav>

      <div className="hidden w-full flex-col gap-3 sm:flex-row sm:items-center sm:gap-[12px] lg:flex lg:w-auto">
        {isAuthenticated ? (
          <>
            <button
              className="button-interactive inline-flex h-[36px] w-full items-center justify-center rounded-[7px] border border-[#d9e2ec] bg-white px-[18px] text-[12px] font-medium text-[#1f2937] sm:w-auto"
              onClick={handleLogout}
              type="button"
            >
              Log out
            </button>
            <Link
              className="button-interactive inline-flex h-[36px] w-full items-center justify-center rounded-[7px] bg-brand-500 px-[22px] text-[12px] font-semibold text-white sm:w-auto"
              to={user?.role === 'admin' ? '/admin' : '/dashboard'}
            >
              {user?.role === 'admin' ? 'Admin' : 'Dashboard'}
            </Link>
          </>
        ) : (
          <>
            <Link
              className="button-interactive inline-flex h-[36px] w-full items-center justify-center rounded-[7px] border border-[#d9e2ec] bg-white px-[18px] text-[12px] font-medium text-[#1f2937] sm:w-auto"
              to="/login"
            >
              Log in
            </Link>
            <Link
              className="button-interactive inline-flex h-[36px] w-full items-center justify-center rounded-[7px] bg-brand-500 px-[22px] text-[12px] font-semibold text-white sm:w-auto"
              to="/signup"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>

      {isMenuOpen ? (
        <div className="absolute right-4 top-full z-20 mt-3 flex w-[calc(100%-2rem)] flex-col rounded-[12px] border border-[#e8edf3] bg-white p-4 shadow-[0_18px_36px_-26px_rgba(15,23,42,0.35)] sm:right-5 sm:w-[320px] lg:hidden">
          <nav className="flex flex-col gap-4 text-[12px] font-medium text-[#0f1728]">
            {navigationLinks.map(renderNavItem)}
          </nav>

          <div className="mt-4 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <button
                  className="button-interactive inline-flex h-[36px] w-full items-center justify-center rounded-[7px] border border-[#d9e2ec] bg-white px-[18px] text-[12px] font-medium text-[#1f2937]"
                  onClick={handleLogout}
                  type="button"
                >
                  Log out
                </button>
                <Link
                  className="button-interactive inline-flex h-[36px] w-full items-center justify-center rounded-[7px] bg-brand-500 px-[22px] text-[12px] font-semibold text-white"
                  onClick={handleMenuClose}
                  to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                >
                  {user?.role === 'admin' ? 'Admin' : 'Dashboard'}
                </Link>
              </>
            ) : (
              <>
                <Link
                  className="button-interactive inline-flex h-[36px] w-full items-center justify-center rounded-[7px] border border-[#d9e2ec] bg-white px-[18px] text-[12px] font-medium text-[#1f2937]"
                  onClick={handleMenuClose}
                  to="/login"
                >
                  Log in
                </Link>
                <Link
                  className="button-interactive inline-flex h-[36px] w-full items-center justify-center rounded-[7px] bg-brand-500 px-[22px] text-[12px] font-semibold text-white"
                  onClick={handleMenuClose}
                  to="/signup"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}

export default Navbar
