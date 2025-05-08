import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Helmet } from 'react-helmet-async';
import clsx from 'clsx'; // Import clsx

// Define interfaces matching backend Order structure (populated for admin view)
// Assuming the backend structure is { data: { orders: [...] } } for the GET /admin/orders route
interface Order {
  _id: string;
  orderNumber?: string; // Order number might be optional initially or not generated for old orders
   user: { _id: string; name: string }; // Populated user details
  items: Array<{ // Array of order items
    _id?: string; // Item ID (optional as it might not always be selected explicitly)
     product: { _id: string; name: string; price: number; images?: string[] }; // Populated product details, added images
    quantity: number; // Changed from qty to quantity
    price: number; // Price at time of order
     size?: string; // Added size
  }>;
  shippingAddress: { // Assuming this is now an object
     firstName: string; lastName: string; address: string; city: string; state: string; postalCode: string; country: string; // Add all fields
  };
  shippingCost: number;
  tax: number;
  total: number;
  // Use the updated enum that includes Processing
  status: 'Pending' | 'Processing' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled'; // Use union type for status
  createdAt: string;
}


export default function AdminOrders(): JSX.Element { // Added return type annotation for the component
   // Fetch Orders from backend admin route
  // Assuming the backend structure is { data: { orders: [...] } } for the GET /admin/orders route
  const { data: ordersResponse, isLoading, isError, error } = useQuery<{ data: { orders: Order[] } }>({ // Expecting { data: { orders: [...] } }
    queryKey: ['admin-orders'],
    queryFn: async () => {
      try {
         // Corrected type annotation for axios response
         const { data } = await api.get<{ data: { orders: Order[] } }>('/admin/orders'); // Assuming the admin orders route is /admin/orders
         console.log('Admin Orders API response:', data);
         if (!data || !data.data || !Array.isArray(data.data.orders)) { // Check if data, data.data, and orders is an array
            console.error('Invalid Admin Orders API response format:', data);
            throw new Error("Invalid data format from API");
         }
         return data; // Return the full data object, including the 'data' key
      } catch (error) {
         console.error("Failed to fetch orders:", error);
         throw error;
      }
    },
     retry: false,
  });

   // Access the orders array from the response data
   const orders = ordersResponse?.data?.orders; // Access the nested 'data.orders' property

   // Optional: Define mutation for deleting a review
  // const deleteMutation = useMutation({
  //   mutationFn: (reviewId: string) => {
  //      // Need product ID to delete nested review - update backend route if needed
  //     // Assuming a route like DELETE /admin/reviews/:reviewId might exist
  //     return api.delete(`/admin/reviews/${reviewId}`);
  //   },
  //   onSuccess: () => {
  //     toast.success('Review deleted successfully');
  //     queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }); // Refetch reviews
  //   },
  //   onError: (error: any) => {
  //     toast.error(error?.response?.data?.message || 'Failed to delete review');
  //     console.error("Delete review error:", error);
  //   },
  // });


  return (
    <>
       <Helmet>
         <title>Admin - Orders | Store</title>
       </Helmet>
       <div className="px-4 sm:px-6 lg:px-8">
         <div className="sm:flex sm:items-center">
           <div className="sm:flex-auto">
             <h1 className="text-2xl font-semibold leading-6 text-gray-900">Orders Management</h1>
             <p className="mt-2 text-sm text-gray-700">View and manage customer orders here.</p>
           </div>
           {/* Add button for actions if needed (e.g., update status) */}
         </div>

         <div className="mt-8 flow-root">
           <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
             <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
               {isLoading ? (
                 <div className="grid place-items-center py-10">
                   <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                 </div>
               ) : isError || !orders ? ( // Handle error state, check if orders is null/undefined after loading
                  <div className="text-center py-12 text-red-600">
                      Error loading orders. {isError ? (error instanceof Error ? error.message : '') : 'Orders data not available.'}
                  </div>
               ) : orders.length > 0 ? ( // Check if orders array is not empty
                 <table className="min-w-full divide-y divide-gray-300">
                   <thead>
                     <tr>
                       <th
                         scope="col"
                         className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                       >
                         Order #
                       </th>
                       <th
                         scope="col"
                         className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                       >
                         Customer
                       </th>
                       <th
                         scope="col"
                         className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                       >
                         Total
                       </th>
                       <th
                         scope="col"
                         className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                       >
                         Status
                       </th>
                        <th
                         scope="col"
                         className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                       >
                         Items
                       </th>
                       <th
                         scope="col"
                         className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                       >
                         Shipping Address
                       </th>
                       <th
                         scope="col"
                         className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                       >
                         Date
                       </th>
                       <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                         <span className="sr-only">Actions</span>
                       </th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-200">
                     {orders.map((order: Order) => ( // Added type annotation for order
                       <tr key={order._id}>
                         <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{order.orderNumber || order._id}</td> {/* Use orderNumber if available */}
                         <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                           {order.user?.name || 'N/A'} {/* Use optional chaining */}
                         </td>
                         <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                           ${order.total?.toFixed(2) || '0.00'} {/* Use optional chaining and toFixed */}
                         </td>
                         <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                           <span
                             className={clsx(
                               'inline-flex rounded-full px-2 text-xs font-semibold leading-5 capitalize', // Capitalize status
                               {
                                 'bg-green-100 text-green-800': order.status === 'Delivered',
                                 'bg-blue-100 text-blue-800': order.status === 'Shipped',
                                 // Corrected comparison to include 'Processing'
                                 'bg-yellow-100 text-yellow-800': order.status === 'Pending' || order.status === 'Confirmed' || order.status === 'Processing',
                                 'bg-red-100 text-red-800': order.status === 'Cancelled',
                               }
                             )}
                           >
                             {order.status}
                           </span>
                         </td>
                         <td className="px-3 py-4 text-sm text-gray-500">
                           <ul className="list-disc list-inside">
                              {/* Access items via optional chaining, add type annotation */}
                              {order.items?.slice(0, 2).map((item, idx: number) => ( // Show max 2 items, add idx type
                                 // Add key for list items
                                 <li key={item.product?._id || idx} className="whitespace-nowrap"> {/* Use product _id or index as key */}
                                    {/* Access product name via optional chaining, access quantity */}
                                    {item.product?.name} ({item.quantity})
                                 </li>
                              ))}
                            {/* Indicate more items only if there are more than 2 */}
                            {order.items && order.items.length > 2 && (<span>...</span>)}
                           </ul>
                         </td>
                         <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                           {new Date(order.createdAt).toLocaleDateString()}
                         </td>
                         <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                           {/* Add actions like "View Details" or "Update Status" */}
                           {/* <Link to={`/admin/orders/${order._id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">View</Link> */}
                            {/* Example status update button */}
                            {/* {order.status === 'Pending' && (
                              <button className="text-green-600 hover:text-green-900">Confirm</button>
                            )} */}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               ) : (
                  <div className="text-center py-12"> {/* Empty state */}
                     <p className="text-sm text-gray-500">No orders found.</p>
                  </div>
               )}
             </div>
           </div>
         </div>
       </div>
    </>
  );
}