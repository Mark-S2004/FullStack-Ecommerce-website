//client/src/App.tsx
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Optional - Uncomment if you want devtools
import { HelmetProvider } from 'react-helmet-async';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import React from 'react'; // Import React for JSX


// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import RootLayout from './layouts/RootLayout';
import AdminLayout from './layouts/AdminLayout';
import PublicLayout from './layouts/PublicLayout';

// Pages - Ensure these files exist and export a default React functional component
import HomePage from './pages/HomePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/auth/ProfilePage';
// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminDiscounts from './pages/admin/Discounts';
import AdminReviews from './pages/admin/Reviews';
// Checkout status pages (create these files if they don't exist and export a React component)
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import CheckoutCancelPage from './pages/CheckoutCancelPage';


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
        // Ensure HomePage is a component returning JSX
        { index: true, element: <HomePage /> },
        // Changed path parameter name to 'id'
        { path: "product/:id", element: <ProductDetailsPage /> },
        { path: "cart", element: <CartPage /> },
        {
          path: "checkout",
          element: <ProtectedRoute><CheckoutPage /></ProtectedRoute>
        },
        {
          path: "profile",
          element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
        },
        // Add checkout success and cancel pages (ensure files are created and export components)
        { path: "checkout-success", element: <CheckoutSuccessPage /> },
        { path: "checkout-cancel", element: <CheckoutCancelPage /> },
      ],
    },
    {
      // Keep PublicLayout for login/register pages without the main navbar/footer
      path: "/",
      element: <PublicLayout />,
      children: [
        { path: "login", element: <LoginPage /> },
        { path: "register", element: <RegisterPage /> },
      ],
    },
    {
      path: "/admin",
      element: <ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>,
      children: [
        { index: true, element: <AdminDashboard /> },
        { path: "products", element: <AdminProducts /> },
         // Add routes for admin product create/edit if implemented
        // { path: "products/new", element: <AdminNewProduct /> },
        // { path: "products/edit/:id", element: <AdminEditProduct /> },

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
            {/* Using react-hot-toast, remove the other ToastContainer in main.tsx */}
            <Toaster position="top-center" />
            {/* Uncomment ReactQueryDevtools if you want to use them */}
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;