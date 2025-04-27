import { Navigate, Outlet } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import Loader from "@components/common/Loader"

const AuthLayout = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["authStatus"],
    queryFn: async () => {
      const { data } = await axios.get("/api/auth/me")
      return data
    },
    retry: false,
  })

  if (isLoading) return <Loader />
  if (isError) return <Outlet />

  return <Navigate to={`/${data.role}`} replace />
}

export default AuthLayout
