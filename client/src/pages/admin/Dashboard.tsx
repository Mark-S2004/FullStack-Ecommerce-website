import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx'; // Import clsx
import api from '../../lib/axios';
import { Helmet } from 'react-helmet-async'; // Import Helmet

// Define interfaces matching backend response for Dashboard stats
// Assuming the backend structure is { data: { ... } } for the GET /admin route
interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number; // Assuming endpoint provides this
  totalProducts: number; // Assuming endpoint provides this
  recentOrders: Array<{ // Array of orders
    _id: string;
    orderNumber?: string; // Assuming this field might exist
    user: { // Assuming user is populated minimally
      name: string;
    };
     items: Array<{ // Array of order items (nested)
       product: { // Assuming product is populated minimally
         name: string;
         _id: string; // Added _id
       };
       quantity: number; // Added quantity
     }>;
    total: number;
    // Use the updated enum that includes Processing
    status: 'Pending' | 'Processing' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled'; // Use union type for status
    createdAt: string;
  }>;
}

export default function Dashboard(): JSX.Element { // Added return type annotation for the component
   // Fetch stats from backend admin route
  // Assuming the backend structure is { data: { ... } } for the GET /admin route
  const { data: statsResponse, isLoading, isError, error } = useQuery<{ data: DashboardStats }>({ // Expecting { data: DashboardStats }
    queryKey: ['admin-stats'],
    queryFn: async () => {
       // Assuming the admin dashboard route returns the stats directly under a 'data' key
       // Corrected type annotation for axios response
       const { data } = await api.get<{ data: DashboardStats }>('/admin'); // Corrected type annotation for response
       console.log('Admin Stats API response:', data);
        if (!data || !data.data) { // Check if data and data.data exist
           console.error('Invalid Admin Stats API response format:', data);
           throw new Error("Invalid data format from API");
       }
       return data; // Return the full data object, including the 'data' key
    },
     retry: false, // Prevent retries for auth-gated routes on initial load
  });

   // Access the stats object from the response data
   const stats = statsResponse?.data; // Access the nested 'data' property


  if (isLoading) {
    return (
      <div className="grid min-h-[calc(100vh-12rem)] place-items-center"> {/* Adjusted min-height */}
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

   // Handle error state
   if (isError || !stats) { // Check if stats is null/undefined after loading
     return (
       <div className="grid min-h-[calc(100vh-12rem)] place-items-center px-4 py-16">
         <div className="text-center">
           <h2 className="text-lg font-semibold text-red-700">Error Loading Dashboard</h2>
           <p className="mt-1 text-gray-500">
              {isError ? (error instanceof Error ? error.message : 'Failed to load dashboard data.') : 'Dashboard data not available.'}
           </p>
            {isError && (
             <button
               className="mt-6 inline-block rounded-md bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-500"
               onClick={() => window.location.reload()} // Simple reload to retry
             >
               Retry Loading
             </button>
            )}
         </div>
       </div>
     );
   }


  const cards = [
    {
      name: 'Total Orders',
      value: stats.totalOrders, // Use optional chaining
      icon: ClipboardDocumentListIcon,
    },
    {
      name: 'Total Revenue',
      value: `$${stats.totalRevenue?.toFixed(2) || '0.00'}`, // Use optional chaining and toFixed
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Total Customers',
      value: stats.totalCustomers, // Use optional chaining
      icon: UserGroupIcon,
    },
    {
      name: 'Total Products',
      value: stats.totalProducts, // Use optional chaining
      icon: ShoppingBagIcon,
    },
  ];

  return (
    <>
       <Helmet>
         <title>Admin Dashboard | Store</title>
       </Helmet>
       <div>
         <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

         <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
           {cards.map((card) => (
             <div
               key={card.name}
               className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
             >
               <dt>
                 <div className="absolute rounded-md bg-indigo-500 p-3">
                   <card.icon className="h-6 w-6 text-white" aria-hidden="true" />
                 </div>
                 <p className="ml-16 truncate text-sm font-medium text-gray-500">{card.name}</p>
               </dt>
               <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                 <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
               </dd>
             </div>
           ))}
         </dl>

         <h2 className="mt-8 text-lg font-medium leading-6 text-gray-900">Recent Orders</h2>
         <div className="mt-4 flow-root">
           <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
             <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                {/* Check if stats.recentOrders exists and has length > 0 */}
                {stats.recentOrders && stats.recentOrders.length > 0 ? (
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
                        {/* Added Items column */}
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
                         Date
                       </th>
                       <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                         <span className="sr-only">Actions</span>
                       </th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-200">
                     {stats.recentOrders.map((order) => (
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
                          {/* Added Items Cell (showing first few items) */}
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