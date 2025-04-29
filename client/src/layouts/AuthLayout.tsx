import { Navigate, Outlet } from "react-router-dom"
import { useQuery, UseQueryResult } from "@tanstack/react-query"
import axios from "axios"
import Loader from "@components/common/Loader"

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
}

const AuthLayout = () => {
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
  if (userQuery.isError || !userQuery.data) return <Outlet />

  // If we have a valid user, redirect to their role-based dashboard
  return <Navigate to={`/${userQuery.data.role}`} replace />
}

export default AuthLayout
