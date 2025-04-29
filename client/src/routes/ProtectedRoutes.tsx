import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Container, Toolbar } from "@mui/material"
import Box from "@mui/material/Box"
import NavBar from "@/components/navbar/NavBar"
import Loader from "@components/common/Loader"

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

  if (isLoading) return <Loader />
  if (isError) return <Navigate to="/auth/login" replace />
  if (!pathname.startsWith(`/${data.role}`))
    return <Navigate to={`/${data.role}`} replace />

  return (
    <Box>
      <NavBar />
      <Container component="main">
        <Toolbar />
        <Outlet />
      </Container>
    </Box>
  )
}

export default ProtectedRoutes
