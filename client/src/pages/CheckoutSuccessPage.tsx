import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Helmet } from 'react-helmet-async';
// Optional: Fetch order details here using the orderId from search params
// import { useQuery } from '@tanstack/react-query';
// import api from '../lib/axios';

export default function CheckoutSuccessPage() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');

    // Optional: Fetch order details to display on success page
    // const { data: order, isLoading, isError } = useQuery({
    //     queryKey: ['order', orderId],
    //     queryFn: async () => {
    //         if (!orderId) return null;
    //         const { data } = await api.get(`/orders/${orderId}`); // Need to implement this endpoint
    //         return data.order;
    //     },
    //     enabled: !!orderId,
    // });

     useEffect(() => {
       // You might want to do something specific here after success,
       // like trigger a cart clear in your context if it wasn't cleared by the backend
       // However, the backend service now clears the cart *before* the redirect.
       // You might want to fetch the user's cart here to confirm it's empty.
     }, []);


    return (
        <>
             <Helmet>
               <title>Checkout Success | Fashion Store</title>
             </Helmet>
            <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8 text-center">
                    <CheckCircleIcon className="mx-auto h-20 w-20 text-green-500" />
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
                        Payment Successful!
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Thank you for your order. Your payment has been processed successfully.
                    </p>
                     {orderId && (
                        <p className="mt-2 text-sm text-gray-600">
                            Your Order Number is: <span className="font-semibold">{orderId}</span> {/* Display order ID */}
                        </p>
                     )}
                     {/* Optional: Display fetched order details here */}
                     {/* {isLoading && <p>Loading order details...</p>}
                     {isError && <p>Could not load order details.</p>}
                     {order && (
                        <div className="mt-4 text-left p-4 bg-gray-100 rounded">
                            <h3 className="font-semibold">Order Summary</h3>
                            <ul>
                               {order.items.map(item => (
                                 <li key={item._id} className="text-sm text-gray-700">{item.product.name} x {item.quantity}</li>
                               ))}
                            </ul>
                        </div>
                     )} */}

                    <div className="mt-6 flex justify-center space-x-4">
                        <Link
                            to="/profile"
                            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            View My Orders
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