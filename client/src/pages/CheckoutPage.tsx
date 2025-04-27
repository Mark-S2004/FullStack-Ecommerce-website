import React, { useContext, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { CartContext } from '../context/CartContext';
import axios from 'axios';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe('pk_test_51RIDMjQg2l84CpWUvk1kmobF8mN2NRxi19lYjTwvTOMTSbGWbOyi3KgZjFjXeA4cvEU9l7ORb12v3o0UycZ09ykj00OEaxaztr');

const CheckoutPage: React.FC = () => {
  const { cartItems, subtotal, clearCart } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [address, setAddress] = useState({
    line1: '',
    city: '',
    country: '',
    postalCode: ''
  });

  // Calculate estimates (these would normally come from the backend)
  const shippingEstimate = 5.99;
  const taxEstimate = subtotal * 0.085; // 8.5% tax
  const totalEstimate = subtotal + shippingEstimate + taxEstimate;

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get the Stripe instance
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      // Make API call to create order and get Stripe session URL
      const response = await axios.post('/api/orders/checkout', {
        cart: cartItems,
        address
      });

      // Redirect to Stripe Checkout
      if (response.data && response.data.sessionUrl) {
        window.location.href = response.data.sessionUrl;
        clearCart();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('An error occurred during checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If cart is empty, show message
  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <h1>Checkout</h1>
        <p>Your cart is empty. Add some items before checkout.</p>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      
      <div className="checkout-container">
        <div className="checkout-form">
          <h2>Shipping Information</h2>
          <form onSubmit={handleCheckout}>
            <div className="form-group">
              <label htmlFor="line1">Address</label>
              <input
                type="text"
                id="line1"
                name="line1"
                value={address.line1}
                onChange={handleAddressChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={address.city}
                onChange={handleAddressChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={address.country}
                  onChange={handleAddressChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="postalCode">Postal Code</label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={address.postalCode}
                  onChange={handleAddressChange}
                  required
                />
              </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button 
              type="submit" 
              className="checkout-button" 
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </form>
        </div>
        
        <div className="order-summary">
          <h2>Order Summary</h2>
          
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p>Qty: {item.qty}</p>
                </div>
                <div className="item-price">${(item.price * item.qty).toFixed(2)}</div>
              </div>
            ))}
          </div>
          
          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping (estimated)</span>
              <span>${shippingEstimate.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (estimated)</span>
              <span>${taxEstimate.toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${totalEstimate.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 