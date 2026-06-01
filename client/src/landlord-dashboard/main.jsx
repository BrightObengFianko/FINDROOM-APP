import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import LandlordDashboardApp from './LandlordDashboardApp'
import '../index.css'
import './landlordDashboard.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LandlordDashboardApp />
  </StrictMode>,
)
