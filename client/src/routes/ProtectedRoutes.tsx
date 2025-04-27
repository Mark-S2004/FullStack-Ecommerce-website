import { Navigate, Outlet, useLocation } from "react-router-dom"

const ProtectedRoutes = () => {
  const token = localStorage.getItem("token")
  const role = localStorage.getItem("role")
  const { pathname } = useLocation()

  if (!token || !role) return <Navigate to="/auth/login" replace />
  if (!pathname.startsWith(`/${role}`))
    return <Navigate to={`/${role}`} replace />
  return <Outlet />
}

export default ProtectedRoutes
