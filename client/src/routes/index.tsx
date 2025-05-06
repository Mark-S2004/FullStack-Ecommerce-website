import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProductsPage from '../pages/ProductsPage';
import ProductDetailsPage from '../pages/ProductDetailsPage';
import CartPage from '../pages/CartPage';
import AdminInventoryPage from '../pages/AdminInventoryPage';
import OrdersPage from '../pages/OrdersPage';
import AdminOrdersPage from '../pages/AdminOrdersPage';
import DiscountsPage from '../pages/DiscountsPage';
import ReviewsPage from '../pages/ReviewsPage';
import LandingPage from '../pages/LandingPage';
// Placeholder for ProtectedRoute component
const ProtectedRoute: React.FC<{ children: React.ReactNode; role: string }> = ({ children, role }) => {
  // This is a placeholder. Implement actual authentication logic here.
  const isAuthenticated = true; // Replace with real auth check
  const userRole = 'admin'; // Replace with real user role

  if (!isAuthenticated) {
    return <div>Please log in to access this page.</div>;
  }

  if (role && userRole !== role) {
    return <div>You do not have permission to access this page.</div>;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/customer/products" element={<ProductsPage />} />
      <Route path="/customer/products/:id" element={<ProductDetailsPage />} />
      <Route path="/customer/cart" element={<CartPage />} />
      <Route path="/customer/orders" element={<OrdersPage />} />
      <Route path="/customer/discounts" element={<DiscountsPage />} />
      <Route path="/customer/reviews" element={<ReviewsPage />} />
      <Route 
        path="/admin/inventory" 
        element={
          <ProtectedRoute role="admin">
            <AdminInventoryPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/orders" 
        element={
          <ProtectedRoute role="admin">
            <AdminOrdersPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

export default AppRoutes;
