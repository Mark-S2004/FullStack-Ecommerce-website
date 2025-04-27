import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

const ProtectedRoutes = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["authStatus"],
    queryFn: async () => {
      const { data } = await axios.get("/api/auth/me")
      return data
    },
    retry: false,
  })
  const { pathname } = useLocation()

  if (isLoading) return <div>Loading...</div>
  if (isError) return <Navigate to="/auth/login" replace />
  if (!pathname.startsWith(`/${data.role}`))
    return <Navigate to={`/${data.role}`} replace />

  return <Outlet />
}

export default ProtectedRoutes
