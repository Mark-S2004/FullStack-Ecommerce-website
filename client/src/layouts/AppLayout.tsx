import { Suspense } from "react"
import { Outlet } from "react-router-dom"
import Loader from "@/components/common/Loader"
import { ToastContainer } from "react-toastify"
import Box from "@mui/material/Box"
import NavBar from "@/components/navbar/NavBar"
import { Container } from "@mui/material"
import "react-toastify/dist/ReactToastify.css"

const AppLayout = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <NavBar />
        <Container component="main" sx={{ flex: 1, py: 4 }}>
          <Outlet />
        </Container>
        <ToastContainer position="bottom-right" />
      </Box>
    </Suspense>
  )
}

export default AppLayout
