import { useState } from 'react'
import AdminModuleLayout from '../admin/pages/AdminModuleLayout'
import AdminOverviewPage from '../admin/pages/AdminOverviewPage'
import AdminListingsPage from '../admin/pages/AdminListingsPage'
import AdminListingDetailsPage from '../admin/pages/AdminListingDetailsPage'
import AdminUsersPage from '../admin/pages/AdminUsersPage'
import AdminLandlordsPage from '../admin/pages/AdminLandlordsPage'
import AdminBookingsPage from '../admin/pages/AdminBookingsPage'
import AdminMessagesPage from '../admin/pages/AdminMessagesPage'
import AdminReportsPage from '../admin/pages/AdminReportsPage'
import AdminSettingsPage from '../admin/pages/AdminSettingsPage'

const pageRegistry = {
  overview: {
    render: () => <AdminOverviewPage />,
  },
  listings: {
    render: () => <AdminListingsPage />,
  },
  'listing-details': {
    render: () => <AdminListingDetailsPage />,
  },
  users: {
    render: () => <AdminUsersPage />,
  },
  landlords: {
    render: () => <AdminLandlordsPage />,
  },
  bookings: {
    render: () => <AdminBookingsPage />,
  },
  messages: {
    render: () => <AdminMessagesPage />,
  },
  reports: {
    render: () => <AdminReportsPage />,
  },
  settings: {
    render: () => <AdminSettingsPage />,
  },
}

function AdminDashboardApp() {
  const [activePage, setActivePage] = useState('overview')
  const currentPage = pageRegistry[activePage] || pageRegistry.overview

  return (
    <AdminModuleLayout activePage={activePage} onSelect={setActivePage}>
      {currentPage.render()}
    </AdminModuleLayout>
  )
}

export default AdminDashboardApp
