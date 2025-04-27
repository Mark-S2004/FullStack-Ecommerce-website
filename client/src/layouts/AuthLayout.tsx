import { Navigate, Outlet } from "react-router-dom"

const AuthLayout = () => {
  const token = localStorage.getItem("token")
  const role = localStorage.getItem("role")

  if (token && role) return <Navigate to={`/${role}`} replace />

  return (
    <>
      <Outlet />
    </>
  )
}

export default AuthLayout
