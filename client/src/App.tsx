import { BrowserRouter } from "react-router-dom"
import CssBaseline from "@mui/material/CssBaseline"
import AllRoutes from "@routes"

function App() {
  return (
    <>
      <CssBaseline />
      <BrowserRouter>
        <AllRoutes />
      </BrowserRouter>
    </>
  )
}

export default App
