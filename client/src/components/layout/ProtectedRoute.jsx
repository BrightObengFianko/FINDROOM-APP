import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getLandlordVerificationRedirect } from '../../utils/landlordVerification'

function ProtectedRoute({ children, roles, requireApprovedLandlord = false }) {
  const location = useLocation()
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="section-card mt-8 text-center">
        <p className="text-sm text-slate-500">Loading your workspace...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (roles?.length && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  if (requireApprovedLandlord && user?.role === 'landlord') {
    const redirectPath = getLandlordVerificationRedirect(user, location.pathname)

    if (redirectPath !== location.pathname) {
      return <Navigate replace state={{ from: location.pathname }} to={redirectPath} />
    }
  }

  return children
}

export default ProtectedRoute
