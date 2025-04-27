import { useState } from "react"
import { BrowserRouter } from "react-router-dom"
import CssBaseline from "@mui/material/CssBaseline"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import AllRoutes from "@routes/index"

function App() {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AllRoutes />
        </BrowserRouter>

        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  )
}

export default App
