import { useState, useEffect } from "react"
import { Navigate, Outlet } from "react-router-dom"
import Loader from "@components/common/Loader"
import { authService } from "../services/auth.service"

const AuthLayout = () => {
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
    return <Outlet />
  }
  
  // If authenticated, redirect to user's role dashboard
  return <Navigate to={`/${authService.currentUser.role}`} replace />
}

export default AuthLayout
