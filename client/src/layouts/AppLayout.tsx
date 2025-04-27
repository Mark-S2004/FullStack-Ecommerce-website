import { Suspense } from "react"
import { Outlet } from "react-router-dom"
import Loader from "@/components/common/Loader"
import { ToastContainer } from "react-toastify"
import Box from "@mui/material/Box"

const AppLayout = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Outlet />
      </Box>
      <ToastContainer position="bottom-right" />
    </Suspense>
  )
}

export default AppLayout
