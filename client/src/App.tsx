import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import LandingPage from './pages/LandingPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import ReviewsPage from './pages/ReviewsPage';
import DiscountsPage from './pages/DiscountsPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import ComingSoon from './components/ComingSoon';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ToastContainer from './components/common/ToastContainer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

export default function App() {
  const [ping, setPing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get('/api/ping')
      .then(res => {
        if (res.data && res.data.msg) {
          setPing(res.data.msg);
        } else {
          setError('Invalid response from server');
        }
      })
      .catch(err => {
        console.error('Error connecting to backend:', err);
        setError(err.message || 'Failed to connect to backend');
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-gray-100">
              <Navbar />
              <ToastContainer />
              <main className="container mx-auto p-6">
                <div className="bg-white shadow rounded-lg p-6 max-w-md mx-auto text-center">
                  <h2 className="text-lg font-semibold mb-3 text-gray-700">Backend Connection Test:</h2>
                  {error ? (
                    <p className="text-xl font-bold text-red-600">❌ Error: {error}</p>
                  ) : ping ? (
                    <p className="text-xl font-bold text-green-600">✅ Backend says: "{ping}"</p>
                  ) : (
                    <p className="text-xl font-bold text-blue-600">Loading...</p>
                  )}
                </div>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/products/:id" element={<ProductDetailsPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:id" element={<OrderDetailPage />} />
                  <Route path="/reviews" element={<ReviewsPage />} />
                  <Route path="/discounts" element={<DiscountsPage />} />
                  
                  {/* Admin routes */}
                  <Route path="/admin/inventory" element={<AdminInventoryPage />} />
                  <Route path="/admin/orders" element={<ComingSoon title="Admin Orders" />} />
                  <Route path="/admin/customers" element={<ComingSoon title="Customer Management" />} />
                  <Route path="/admin/analytics" element={<ComingSoon title="Analytics Dashboard" />} />
                  
                  {/* Catch-all route */}
                  <Route
                    path="*"
                    element={
                      <ComingSoon
                        title="404 - Page Not Found"
                        description="The page you're looking for doesn't exist."
                        linkText="Go back home"
                        linkTo="/"
                      />
                    }
                  />
                </Routes>
              </main>
              <footer className="bg-white mt-auto">
                <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
                  <div className="mt-8 md:order-1 md:mt-0">
                    <p className="text-center text-xs leading-5 text-gray-500">
                      &copy; {new Date().getFullYear()} Your Store Name. All rights reserved.
                    </p>
                  </div>
                </div>
              </footer>
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
