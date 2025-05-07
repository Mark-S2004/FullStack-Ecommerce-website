import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { HelmetProvider } from 'react-helmet-async';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import RootLayout from './layouts/RootLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import HomePage from './pages/HomePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/auth/ProfilePage';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminDiscounts from './pages/admin/Discounts';
import AdminReviews from './pages/admin/Reviews';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
    },
  },
});

// Create router with future flag
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <RootLayout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: "product/:id", element: <ProductDetailsPage /> },
        { path: "cart", element: <CartPage /> },
        { 
          path: "checkout", 
          element: <ProtectedRoute><CheckoutPage /></ProtectedRoute> 
        },
        { path: "login", element: <LoginPage /> },
        { path: "register", element: <RegisterPage /> },
        { 
          path: "profile", 
          element: <ProtectedRoute><ProfilePage /></ProtectedRoute> 
        },
      ],
    },
    {
      path: "/admin",
      element: <ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>,
      children: [
        { index: true, element: <AdminDashboard /> },
        { path: "products", element: <AdminProducts /> },
        { path: "orders", element: <AdminOrders /> },
        { path: "discounts", element: <AdminDiscounts /> },
        { path: "reviews", element: <AdminReviews /> },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <RouterProvider router={router} />
            <Toaster position="top-center" />
            <ReactQueryDevtools initialIsOpen={false} />
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
