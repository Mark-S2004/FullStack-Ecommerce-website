import { lazy } from "react"
import { Routes, Route } from "react-router-dom"
import { CartProvider } from "@context/CartContext"

const AppLayout = lazy(() => import("@layouts/AppLayout"))
const ProtectedRoutes = lazy(() => import("@routes/ProtectedRoutes"))

const AuthLayout = lazy(() => import("@layouts/AuthLayout"))
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"))
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"))

const ProductsPage = lazy(() => import("@/pages/customer/ProductsPage"))
const CartPage = lazy(() => import("@/pages/customer/CartPage"))
const OrdersPage = lazy(() => import("@/pages/customer/OrdersPage"))
const CheckoutPage = lazy(() => import("@/pages/customer/CheckoutPage"))
const CheckoutSuccess = lazy(() => import("@/pages/customer/CheckoutSuccess"))

const InventoryPage = lazy(() => import("@pages/admin/InventoryPage"))
const AdminOrdersPage = lazy(() => import("@pages/admin/OrdersPage"))


const LandingPage = lazy(() => import("@/pages/LandingPage"));

const AllRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
      <Route index element={<LandingPage />} /> 
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
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default AllRoutes
