import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface ShippingInfo {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phoneNo: string;
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image: string;
  product: string;
  _id: string;
}

interface PaymentInfo {
  id: string;
  status: string;
}

interface Order {
  _id: string;
  shippingInfo: ShippingInfo;
  orderItems: OrderItem[];
  user: string;
  paymentInfo: PaymentInfo;
  paidAt: string;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  orderStatus: string;
  deliveredAt?: string;
  createdAt: string;
}

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/orders/${id}`);
        
        if (data.success) {
          setOrder(data.order);
        } else {
          setError('Failed to fetch order details');
        }
      } catch (err: any) {
        console.error('Error fetching order:', err);
        setError(err.response?.data?.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && id) {
      fetchOrder();
    }
  }, [isAuthenticated, id]);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not Available';
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          You need to be logged in to view order details.
        </div>
        <Link 
          to="/login" 
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
        >
          Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link 
          to="/orders"
          className="text-blue-500 hover:underline"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Order not found.
        </div>
        <Link 
          to="/orders"
          className="text-blue-500 hover:underline"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link 
          to="/orders"
          className="text-blue-500 hover:underline"
        >
          ← Back to Orders
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Order #{order._id}</h1>
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
              {order.orderStatus}
            </span>
          </div>
          
          <p className="text-gray-600">
            <span className="font-medium">Placed on:</span> {formatDate(order.createdAt)}
          </p>
          
          {order.deliveredAt && (
            <p className="text-gray-600 mt-1">
              <span className="font-medium">Delivered on:</span> {formatDate(order.deliveredAt)}
            </p>
          )}
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Information */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Shipping Information</h2>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-700">{order.shippingInfo.address}</p>
              <p className="text-gray-700">{order.shippingInfo.city}, {order.shippingInfo.state}</p>
              <p className="text-gray-700">{order.shippingInfo.country} - {order.shippingInfo.zipCode}</p>
              <p className="text-gray-700 mt-2">
                <span className="font-medium">Phone:</span> {order.shippingInfo.phoneNo}
              </p>
            </div>
          </div>
          
          {/* Payment Information */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-3">Payment Information</h2>
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-gray-700">
                <span className="font-medium">Payment ID:</span> {order.paymentInfo.id}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Status:</span>{' '}
                <span className={order.paymentInfo.status === 'succeeded' ? 'text-green-600' : 'text-yellow-600'}>
                  {order.paymentInfo.status}
                </span>
              </p>
              <p className="text-gray-700 mt-2">
                <span className="font-medium">Paid at:</span> {formatDate(order.paidAt)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Order Items */}
        <div className="p-6 border-t">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Order Items</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.orderItems.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            <Link to={`/products/${item.product}`} className="hover:text-blue-500">
                              {item.name}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${item.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="p-6 border-t bg-gray-50">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
          
          <div className="max-w-md ml-auto">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">${order.itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tax:</span>
              <span className="text-gray-900">${order.taxPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Shipping:</span>
              <span className="text-gray-900">${order.shippingPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-lg font-bold text-gray-800">Total:</span>
              <span className="text-lg font-bold text-gray-800">${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage; 