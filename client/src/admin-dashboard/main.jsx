import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AdminDashboardApp from './AdminDashboardApp'
import '../index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminDashboardApp />
  </StrictMode>,
)
