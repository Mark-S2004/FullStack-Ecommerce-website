import { Link } from 'react-router-dom';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { Helmet } from 'react-helmet-async';

export default function CheckoutCancelPage() {
    return (
         <>
             <Helmet>
               <title>Checkout Cancelled | Fashion Store</title>
             </Helmet>
            <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 text-center">
                    <XCircleIcon className="mx-auto h-20 w-20 text-red-500" />
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Payment Cancelled
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Your payment was not completed. You can try again or continue shopping.
                    </p>
                    <div className="mt-6 flex justify-center space-x-4">
                        <Link
                            to="/cart"
                            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Back to Cart
                        </Link>
                        <Link
                            to="/"
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
         </>
    );
}