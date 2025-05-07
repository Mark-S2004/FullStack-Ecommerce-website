import { lazy } from "react"
import { Routes, Route } from "react-router-dom"
import { CartProvider } from "@context/CartContext"

const AppLayout = lazy(() => import("@layouts/AppLayout"))
const ProtectedRoutes = lazy(() => import("@routes/ProtectedRoutes"))

const AuthLayout = lazy(() => import("@layouts/AuthLayout"))
const LoginPage = lazy(() => import("@pages/LoginPage"))
const RegisterPage = lazy(() => import("@pages/RegisterPage"))

const ProductsPage = lazy(() => import("@pages/ProductsPage"))
const CartPage = lazy(() => import("@pages/CartPage"))
const OrdersPage = lazy(() => import("@pages/OrdersPage"))
const CheckoutPage = lazy(() => import("@pages/CheckoutPage"))
const CheckoutSuccess = lazy(() => import("@pages/CheckoutSuccess"))

const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<div>Home Page (placeholder)</div>} />
        <Route path="auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
        {/* User must be authenticated to access these routes */}
        <Route element={<ProtectedRoutes />}>
          <Route path="customer">
            <Route path="products" element={<ProductsPage />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route
              path="checkout"
              element={
                <CartProvider>
                  <CheckoutPage />
                </CartProvider>
              }
            />
            <Route
              path="checkout-success"
              element={
                <CartProvider>
                  <CheckoutSuccess />
                </CartProvider>
              }
            />
          </Route>

          <Route path="admin">
            <Route path="inventory" element={<div>inventory</div>} />
            <Route path="orders" element={<div>orders</div>} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default AllRoutes
