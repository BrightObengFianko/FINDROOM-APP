import { Route, Routes } from 'react-router-dom'
import AdminBookingsPage from './admin/pages/AdminBookingsPage.jsx'
import AdminLandlordsPage from './admin/pages/AdminLandlordsPage.jsx'
import AdminListingDetailsPage from './admin/pages/AdminListingDetailsPage.jsx'
import AdminListingsPage from './admin/pages/AdminListingsPage.jsx'
import AdminMessagesPage from './admin/pages/AdminMessagesPage.jsx'
import AdminModuleLayout from './admin/pages/AdminModuleLayout.jsx'
import AdminOverviewPage from './admin/pages/AdminOverviewPage.jsx'
import AdminReportsPage from './admin/pages/AdminReportsPage.jsx'
import AdminSettingsPage from './admin/pages/AdminSettingsPage.jsx'
import AdminUsersPage from './admin/pages/AdminUsersPage.jsx'
import MainLayout from './components/layout/MainLayout.jsx'
import ProtectedRoute from './components/layout/ProtectedRoute.jsx'
import AuthPage from './pages/AuthPage.jsx'
import BookingsHomePage from './pages/BookingsHomePage.jsx'
import DashboardHomePage from './pages/DashboardHomePage.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import LandingPage from './pages/LandingPage.jsx'
import BookingCheckoutPage from './pages/booking/BookingCheckoutPage.jsx'
import BookingPaymentPage from './pages/booking/BookingPaymentPage.jsx'
import BookingSuccessPage from './pages/booking/BookingSuccessPage.jsx'
import MessagesPage from './pages/MessagesPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import LandlordAddListingPage from './pages/landlord/LandlordAddListingPage.jsx'
import LandlordEarningsPage from './pages/landlord/LandlordEarningsPage.jsx'
import LandlordListingsPage from './pages/landlord/LandlordListingsPage.jsx'
import LandlordVerificationPage from './pages/landlord/LandlordVerificationPage.jsx'
import LandlordVerificationSubmittedPage from './pages/landlord/LandlordVerificationSubmittedPage.jsx'
import PaymentsPage from './pages/PaymentsPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import RoomDetailsPage from './pages/RoomDetailsPage.jsx'
import SearchRoomsPage from './pages/SearchRoomsPage.jsx'

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />} path="/">
        <Route element={<LandingPage />} index />
        <Route element={<AuthPage mode="login" />} path="login" />
        <Route element={<AuthPage mode="signup" />} path="signup" />
        <Route element={<SearchRoomsPage />} path="rooms" />
        <Route element={<RoomDetailsPage />} path="rooms/:roomId" />
        <Route
          element={
            <ProtectedRoute roles={['user']}>
              <BookingCheckoutPage />
            </ProtectedRoute>
          }
          path="rooms/:roomId/book"
        />
        <Route
          element={
            <ProtectedRoute roles={['user']}>
              <BookingPaymentPage />
            </ProtectedRoute>
          }
          path="rooms/:roomId/book/payment"
        />
        <Route
          element={
            <ProtectedRoute roles={['user']}>
              <BookingSuccessPage />
            </ProtectedRoute>
          }
          path="rooms/:roomId/book/success"
        />
        <Route
          element={
            <ProtectedRoute roles={['landlord']}>
              <LandlordVerificationPage />
            </ProtectedRoute>
          }
          path="landlord/verification"
        />
        <Route
          element={
            <ProtectedRoute roles={['landlord']}>
              <LandlordVerificationSubmittedPage />
            </ProtectedRoute>
          }
          path="landlord/verification/submitted"
        />
        <Route
          element={
            <ProtectedRoute requireApprovedLandlord roles={['user', 'landlord', 'admin']}>
              <DashboardHomePage />
            </ProtectedRoute>
          }
          path="dashboard"
        />
        <Route
          element={
            <ProtectedRoute requireApprovedLandlord roles={['user', 'landlord']}>
              <BookingsHomePage />
            </ProtectedRoute>
          }
          path="bookings"
        />
        <Route
          element={
            <ProtectedRoute requireApprovedLandlord roles={['user', 'landlord']}>
              <MessagesPage />
            </ProtectedRoute>
          }
          path="messages"
        />
        <Route
          element={
            <ProtectedRoute roles={['user']}>
              <PaymentsPage />
            </ProtectedRoute>
          }
          path="payments"
        />
        <Route
          element={
            <ProtectedRoute requireApprovedLandlord roles={['landlord']}>
              <LandlordListingsPage />
            </ProtectedRoute>
          }
          path="landlord/listings"
        />
        <Route
          element={
            <ProtectedRoute requireApprovedLandlord roles={['landlord']}>
              <LandlordAddListingPage />
            </ProtectedRoute>
          }
          path="landlord/listings/new"
        />
        <Route
          element={
            <ProtectedRoute requireApprovedLandlord roles={['landlord']}>
              <LandlordAddListingPage />
            </ProtectedRoute>
          }
          path="landlord/listings/:listingId/edit"
        />
        <Route
          element={
            <ProtectedRoute requireApprovedLandlord roles={['landlord']}>
              <LandlordEarningsPage />
            </ProtectedRoute>
          }
          path="earnings"
        />
        <Route
          element={
            <ProtectedRoute roles={['user', 'landlord', 'admin']}>
              <ProfilePage />
            </ProtectedRoute>
          }
          path="profile"
        />
        <Route
          element={
            <ProtectedRoute roles={['user', 'landlord']}>
              <FavoritesPage />
            </ProtectedRoute>
          }
          path="favorites"
        />
        <Route
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminModuleLayout />
            </ProtectedRoute>
          }
          path="admin"
        >
          <Route element={<AdminOverviewPage />} index />
          <Route element={<AdminUsersPage />} path="users" />
          <Route element={<AdminLandlordsPage />} path="landlords" />
          <Route element={<AdminListingsPage />} path="listings" />
          <Route element={<AdminListingDetailsPage />} path="listings/:listingId" />
          <Route element={<AdminMessagesPage />} path="messages" />
          <Route element={<AdminBookingsPage />} path="bookings" />
          <Route element={<AdminReportsPage />} path="reports" />
          <Route element={<AdminSettingsPage />} path="settings" />
        </Route>
        <Route element={<NotFoundPage />} path="*" />
      </Route>
    </Routes>
  )
}

export default App
