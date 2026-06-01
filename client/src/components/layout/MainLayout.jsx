import { Outlet, useLocation } from 'react-router-dom'

function MainLayout() {
  const location = useLocation()
  const isStandaloneAuthRoute = ['/login', '/signup'].includes(location.pathname)
  const isVerificationRoute = location.pathname.startsWith('/landlord/verification')
  const isAuthRoute =
    isStandaloneAuthRoute ||
    isVerificationRoute
  const isLandingRoute = location.pathname === '/'

  return (
    <div className={`min-h-screen ${isLandingRoute ? 'bg-white' : 'bg-[#f7f8f3]'}`}>
      <main
        className={`${
          isVerificationRoute
            ? 'page-shell flex min-h-screen items-start justify-center py-2 sm:py-3 lg:items-center'
            : isStandaloneAuthRoute
            ? 'page-shell flex min-h-[100dvh] items-start justify-center py-4 sm:py-6 lg:items-center'
            : isAuthRoute
            ? 'page-shell flex min-h-screen items-start justify-center py-4 sm:py-6 lg:items-center'
            : isLandingRoute
              ? 'page-shell py-6'
              : 'page-shell py-4 sm:py-6'
        }`}
      >
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
