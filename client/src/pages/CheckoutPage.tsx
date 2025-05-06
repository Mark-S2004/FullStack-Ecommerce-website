import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import DiscountForm from '../components/checkout/DiscountForm';
import ShippingCalculator from '../components/checkout/ShippingCalculator';

interface ShippingInfo {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phoneNo: string;
}

interface PriceBreakdown {
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
}

const initialShippingInfo: ShippingInfo = {
  address: '',
  city: '',
  state: '',
  country: '',
  zipCode: '',
  phoneNo: '',
};

const initialPrices: PriceBreakdown = {
  itemsPrice: 0,
  taxPrice: 0,
  shippingPrice: 0,
  totalPrice: 0
};

const CheckoutPage = () => {
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>(initialShippingInfo);
  const [paymentMethod, setPaymentMethod] = useState<string>('cod');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown>(initialPrices);
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [calculatingPrices, setCalculatingPrices] = useState<boolean>(false);
  
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Set initial price values based on cart
  useEffect(() => {
    setPriceBreakdown(prev => ({
      ...prev,
      itemsPrice: cartTotal,
      // Default values that will be updated by the shipping calculator
      taxPrice: cartTotal * 0.07,
      totalPrice: cartTotal + (cartTotal * 0.07)
    }));
  }, [cartTotal]);

  // Recalculate final price whenever a discount is applied or removed
  useEffect(() => {
    if (appliedDiscount) {
      const newTotal = priceBreakdown.totalPrice - discountAmount;
      setPriceBreakdown(prev => ({
        ...prev,
        totalPrice: newTotal > 0 ? newTotal : 0
      }));
    } else {
      setPriceBreakdown(prev => ({
        ...prev,
        totalPrice: prev.itemsPrice + prev.taxPrice + prev.shippingPrice
      }));
    }
  }, [appliedDiscount, discountAmount]);

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

  const submitShippingInfo = (e: FormEvent) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handleCalculationComplete = (calculation: PriceBreakdown) => {
    setPriceBreakdown(calculation);
    setCalculatingPrices(false);
  };

  const handleApplyDiscount = (discount: any) => {
    setAppliedDiscount(discount);
    setDiscountAmount(discount.discountAmount);
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountAmount(0);
  };

  const placeOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      // For simplicity, we're using cash on delivery
      const paymentInfo = {
        id: 'cod_' + Date.now(),
        status: 'Not Paid',
      };

      const orderItems = cart.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        product: item.productId,
      }));

      // Calculate prices
      const itemsPrice = cartTotal;
      const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
      const shippingPrice = itemsPrice > 200 ? 0 : 50;
      const totalPrice = (itemsPrice + taxPrice + shippingPrice).toFixed(2);

      const orderData = {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      };

      const { data } = await axios.post('/api/orders/new', orderData);

      if (data.success) {
        clearCart();
        navigate(`/orders/${data.order._id}`);
      }
    } catch (err: any) {
      console.error('Order creation error:', err);
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>
      
      {/* Checkout Steps */}
      <div className="flex mb-8">
        <div className={`flex-1 text-center py-2 ${currentStep === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          1. Shipping
        </div>
        <div className={`flex-1 text-center py-2 ${currentStep === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          2. Payment & Order
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="text-red-500">&times;</span>
          </button>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Content */}
        <div className="md:w-2/3">
          {/* Step 1: Shipping Info */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Shipping Information</h2>
              
              <form onSubmit={submitShippingInfo}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="address" className="block text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleShippingChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleShippingChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={shippingInfo.state}
                      onChange={handleShippingChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={shippingInfo.country}
                      onChange={handleShippingChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={handleShippingChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phoneNo" className="block text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="text"
                      id="phoneNo"
                      name="phoneNo"
                      value={shippingInfo.phoneNo}
                      onChange={handleShippingChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                >
                  Continue to Payment
                </button>
              </form>
            </div>
          )}
          
          {/* Step 2: Payment Method */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h2>
              
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <input
                    type="radio"
                    id="payment-cod"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mr-2"
                  />
                  <label htmlFor="payment-cod">Cash on Delivery</label>
                </div>
                <p className="text-sm text-gray-600 ml-6">
                  Pay when you receive your order. (Note: Online payment options would be implemented in a real application)
                </p>
              </div>
              
              <div className="border-t pt-4 mb-4">
                <h3 className="font-medium mb-2">Shipping To:</h3>
                <p className="text-gray-700">
                  {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state}, {shippingInfo.country} - {shippingInfo.zipCode}
                </p>
                <p className="text-gray-700">Phone: {shippingInfo.phoneNo}</p>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-blue-500 hover:underline text-sm mt-2"
                >
                  Edit
                </button>
              </div>
              
              <button
                onClick={placeOrder}
                disabled={loading}
                className={`w-full py-3 rounded font-medium ${
                  loading
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          )}
        </div>
        
        {/* Order Summary */}
        <div className="md:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
            
            <div className="mb-4">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center py-2 border-b">
                  <div className="w-12 h-12 overflow-hidden rounded mr-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{item.name}</p>
                    <p className="text-gray-600 text-sm">
                      {item.quantity} x ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-b py-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Tax (15%)</span>
                <span className="font-medium">${(cartTotal * 0.15).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {cartTotal > 200 ? 'Free' : `$50.00`}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${(
                cartTotal +
                cartTotal * 0.15 +
                (cartTotal > 200 ? 0 : 50)
              ).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 