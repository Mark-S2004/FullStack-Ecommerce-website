import { Navigate, Outlet } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

const AuthLayout = () => {
  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["authStatus"],
    queryFn: async () => {
      const { data } = await axios.get("/api/auth/me")
      return data
    },
    retry: false,
  })

  console.log("error", isError)
  console.log("success", isSuccess)

  if (isLoading) return <div>Loading...</div>
  if (isError) return <Outlet />

  return <Navigate to={`/${data.role}`} replace />
}

export default AuthLayout
