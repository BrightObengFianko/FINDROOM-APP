import { getLandlordVerificationRedirect } from './landlordVerification'

const dashboardRedirectPattern = /^\/(?:dashboard|admin)(?:\/|$)/

export const isMobileViewport = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }

  return window.matchMedia('(max-width: 767px)').matches
}

export const isDashboardRedirect = (path = '') => dashboardRedirectPattern.test(path)

export const getPostLoginRedirect = (user, fallback = '/dashboard', preferLandingOnMobile = false) => {
  const resolvedRedirect = getLandlordVerificationRedirect(user, fallback)

  if (preferLandingOnMobile && isMobileViewport() && isDashboardRedirect(resolvedRedirect)) {
    return '/'
  }

  return resolvedRedirect
}
