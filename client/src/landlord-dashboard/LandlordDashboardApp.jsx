import { useState } from 'react'
import LandlordShell from './components/LandlordShell'
import LandlordAddListingPage from './pages/LandlordAddListingPage'
import LandlordBookingsPage from './pages/LandlordBookingsPage'
import LandlordEarningsPage from './pages/LandlordEarningsPage'
import LandlordListingsPage from './pages/LandlordListingsPage'
import LandlordMessagesPage from './pages/LandlordMessagesPage'
import LandlordOverviewPage from './pages/LandlordOverviewPage'
import LandlordPlaceholderPage from './pages/LandlordPlaceholderPage'

const pageRegistry = {
  dashboard: {
    render: (onSelect) => <LandlordOverviewPage onSelect={onSelect} />,
  },
  'add-listing': {
    render: () => <LandlordAddListingPage />,
  },
  'my-listings': {
    render: (onSelect) => <LandlordListingsPage onSelect={onSelect} />,
  },
  bookings: {
    render: () => <LandlordBookingsPage />,
  },
  messages: {
    render: () => <LandlordMessagesPage />,
  },
  earnings: {
    render: () => <LandlordEarningsPage />,
  },
  profile: {
    render: () => <LandlordPlaceholderPage title="Profile" />,
  },
  settings: {
    render: () => <LandlordPlaceholderPage title="Settings" />,
  },
  logout: {
    render: () => <LandlordPlaceholderPage title="Logout" />,
  },
}

function LandlordDashboardApp() {
  const [activePage, setActivePage] = useState('dashboard')
  const currentPage = pageRegistry[activePage] || pageRegistry.dashboard

  return (
    <LandlordShell activePage={activePage} onSelect={setActivePage}>
      {currentPage.render(setActivePage)}
    </LandlordShell>
  )
}

export default LandlordDashboardApp
