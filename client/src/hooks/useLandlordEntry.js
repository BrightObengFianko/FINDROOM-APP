import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { canAssumeRole } from '../utils/roles'

function useLandlordEntry() {
  const navigate = useNavigate()
  const { isAuthenticated, setActiveRole, user } = useAuth()

  return () => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          from: '/dashboard',
          preferredRole: 'landlord',
        },
      })
      return
    }

    if (canAssumeRole(user, 'landlord')) {
      setActiveRole('landlord')
    }

    navigate('/dashboard')
  }
}

export default useLandlordEntry
