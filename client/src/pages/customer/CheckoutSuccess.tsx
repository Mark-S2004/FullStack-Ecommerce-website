import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const CheckoutSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
      setError('No order ID found');
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`/api/orders/${orderId}`);
      setOrderDetails(response.data);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Unable to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-success">
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-success">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <Link to="/" className="btn-primary">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-success">
      <div className="success-card">
        <div className="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase. Your order has been confirmed.</p>
        
        {orderDetails && (
          <div className="order-details">
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> {orderDetails._id}</p>
            <p><strong>Date:</strong> {new Date(orderDetails.createdAt).toLocaleDateString()}</p>
            <p><strong>Total:</strong> ${orderDetails.total.toFixed(2)}</p>
            
            <div className="items-summary">
              <h3>Items</h3>
              <ul>
                {orderDetails.items.map((item: any, index: number) => (
                  <li key={index}>
                    {item.product} - Qty: {item.qty} - ${(item.price * item.qty).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="address-summary">
              <h3>Shipping Address</h3>
              <p>{orderDetails.shippingAddress.line1}</p>
              <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.postalCode}</p>
              <p>{orderDetails.shippingAddress.country}</p>
            </div>
          </div>
        )}
        
        <div className="actions">
          <Link to="/" className="btn-primary">Continue Shopping</Link>
          <Link to="/orders" className="btn-secondary">View All Orders</Link>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess; 