import { useAuth } from '../context/AuthContext'
import LandlordBookingsPage from './landlord/LandlordBookingsPage'
import BookingsPage from './BookingsPage'

function BookingsHomePage() {
  const { user } = useAuth()

  return user?.role === 'landlord' ? <LandlordBookingsPage /> : <BookingsPage />
}

export default BookingsHomePage
