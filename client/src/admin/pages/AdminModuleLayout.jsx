import { Outlet } from 'react-router-dom'
import { AdminWorkspaceProvider } from '../context/AdminWorkspaceContext'

function AdminModuleLayout() {
  return (
    <AdminWorkspaceProvider>
      <Outlet />
    </AdminWorkspaceProvider>
  )
}

export default AdminModuleLayout
