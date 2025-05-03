import { useState, useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import { Container, Toolbar } from "@mui/material"
import Box from "@mui/material/Box"
import Loader from "@components/common/Loader"
import { getCurrentUser } from "../api/auth"
import { authService } from "../services/auth.service"

const ProtectedRoutes = () => {
  const { pathname } = useLocation()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setIsLoading(true)
        await authService.checkAuth()
        setIsAuthenticated(authService.isAuthenticated)
      } catch (error) {
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuthentication()
  }, [])
  
  if (isLoading) {
    return <Loader />
  }
  
  if (!isAuthenticated || !authService.currentUser) {
    return <Navigate to="/auth/login" replace />
  }
  
  const currentUser = authService.currentUser
  
  // Redirect if user is accessing incorrect role-based route
  if (!pathname.startsWith(`/${currentUser.role}`)) {
    return <Navigate to={`/${currentUser.role}`} replace />
  }

  return (
    <Box>
      <Container component="main">
        <Toolbar />
        <Outlet />
      </Container>
    </Box>
  )
}

export default ProtectedRoutes
