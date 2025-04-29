import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import axios from "axios"
import { Container, Toolbar } from "@mui/material"
import Box from "@mui/material/Box"
import NavBar from "@/components/navbar/NavBar"
import Loader from "@components/common/Loader"

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

const ProtectedRoutes = () => {
  const { pathname } = useLocation()
  
  const userQuery: UseQueryResult<UserData> = useQuery({
    queryKey: ["currentUser"],
    queryFn: async (): Promise<UserData> => {
      try {
        const response = await axios.get("/api/auth/me")
        const userData = response.data.data || response.data
        
        // Validate the user data format
        if (!userData || typeof userData !== 'object' || !userData.role) {
          throw new Error('Invalid user data format');
        }
        
        return userData as UserData
      } catch (err) {
        console.error("Error fetching user data:", err)
        throw err
      }
    },
    retry: false,
  })

  if (userQuery.isLoading) return <Loader />
  if (userQuery.isError || !userQuery.data) return <Navigate to="/auth/login" replace />
  
  const currentUser = userQuery.data;
  
  // Redirect if user is accessing incorrect role-based route
  if (!pathname.startsWith(`/${currentUser.role}`)) {
    return <Navigate to={`/${currentUser.role}`} replace />
  }

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
