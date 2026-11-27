
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation()

  const token = localStorage.getItem('mtaafix_token')
  const storedUser = localStorage.getItem('mtaafix_user')

  let user = null

  try {
    user = storedUser ? JSON.parse(storedUser) : null
  } catch {
    user = null
  }

  // Check authentication
  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  // Check user role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    }

    if (user.role === 'technician') {
      return <Navigate to="/technician/dashboard" replace />
    }

    return <Navigate to="/citizen/dashboard" replace />
  }

  return <Outlet />
}
