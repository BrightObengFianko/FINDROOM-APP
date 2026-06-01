import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LandlordDashboardPage from './landlord/LandlordDashboardPage'
import DashboardPage from './DashboardPage'

function DashboardHomePage() {
  const { user } = useAuth()

  if (user?.role === 'admin') {
    return <Navigate replace to="/admin" />
  }

  return user?.role === 'landlord' ? <LandlordDashboardPage /> : <DashboardPage />
}

export default DashboardHomePage
