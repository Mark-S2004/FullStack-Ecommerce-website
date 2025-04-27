import { lazy } from "react"
import { Routes, Route } from "react-router-dom"
import { CartProvider } from "@context/CartContext"

const ProtectedRoutes = lazy(() => import("@routes/ProtectedRoutes"))

const AuthLayout = lazy(() => import("@layouts/AuthLayout"))
const LoginPage = lazy(() => import("@pages/LoginPage"))
const RegisterPage = lazy(() => import("@pages/RegisterPage"))

const CheckoutPage = lazy(() => {
  import("@pages/CheckoutPage")
})
const CheckoutSuccess = lazy(() => {
  import("@pages/CheckoutSuccess")
})

const AllRoutes = () => {
  return (
    <CartProvider>
      <Routes>
        <Route path="/">
          <Route index element={<div>Home Page (placeholder)</div>} />
          <Route path="auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
          {/* User must be authenticated to access these routes */}
          <Route element={<ProtectedRoutes />}>
            <Route path="customer">
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="checkout-success" element={<CheckoutSuccess />} />
            </Route>

            <Route path="admin"></Route>
          </Route>
        </Route>
      </Routes>
    </CartProvider>
  )
}

export default AllRoutes
