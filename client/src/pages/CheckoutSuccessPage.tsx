import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      clearCart();
    }
  }, [sessionId, clearCart]);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="max-w-xl">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="h-10 w-10 text-green-500" />
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Order successful!
            </h1>
          </div>
          <p className="mt-2 text-base text-gray-500">
            Thank you for your order. We've received your payment and will process your items shortly.
          </p>
          <p className="mt-2 text-base text-gray-500">
            A confirmation email will be sent to your email address with the order details.
          </p>
          <div className="mt-10 border-t border-gray-200 pt-10">
            <h2 className="text-lg font-medium text-gray-900">Order Information</h2>
            <dl className="mt-4 divide-y divide-gray-200 border-b border-gray-200">
              <div className="flex justify-between py-3 text-sm font-medium">
                <dt className="text-gray-500">Order number</dt>
                <dd className="text-gray-900">{sessionId?.substring(0, 8) || 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase()}</dd>
              </div>
              <div className="flex justify-between py-3 text-sm font-medium">
                <dt className="text-gray-500">Status</dt>
                <dd className="text-green-600">Payment confirmed</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-6">
          <Link
            to="/orders"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View order history
            <span aria-hidden="true"> &rarr;</span>
          </Link>
          <Link
            to="/products"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
} 