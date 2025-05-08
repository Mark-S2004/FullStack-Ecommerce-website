import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx'; // Import clsx


// Define a proper Discount interface based on backend data (assuming minimal fields for display)
interface Discount {
  _id: string;
  code: string;
  percentage: number;
  description?: string; // Optional description
  isActive: boolean;
  // Add other relevant fields like expiryDate, usageLimit, etc. if available
   expiryDate?: string; // Assuming ISO string or similar
}

export default function AdminDiscounts(): JSX.Element { // Added return type annotation for the component
  // Fetch Discounts from backend admin route
  // Assuming the backend structure is { data: { discounts: [...] } } for the GET /admin/discounts route
  const { data: discountsResponse, isLoading, isError, error } = useQuery<{ data: { discounts: Discount[] } }>({ // Expecting { data: { discounts: [...] } }
    queryKey: ['admin-discounts'],
    queryFn: async () => {
      try {
        // Corrected type annotation for axios response
        const { data } = await api.get<{ data: { discounts: Discount[] } }>('/admin/discounts'); // Assuming the admin discounts route is /admin/discounts
        console.log('Admin Discounts API response:', data);
         if (!data || !data.data || !Array.isArray(data.data.discounts)) { // Check if data, data.data, and discounts is an array
            console.error('Invalid Admin Discounts API response format:', data);
            throw new Error("Invalid data format from API");
         }
         return data; // Return the full data object, including the 'data' key
      } catch (error) {
        console.error("Failed to fetch discounts:", error);
         throw error;
      }
    },
     retry: false,
  });

   // Access the discounts array from the response data
   const discounts = discountsResponse?.data?.discounts; // Access the nested 'data.discounts' property


  return (
    <>
      <Helmet>
        <title>Admin - Discounts | Store</title>
      </Helmet>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold leading-6 text-gray-900">Discounts Management</h1>
            <p className="mt-2 text-sm text-gray-700">Create and manage store discounts and promotions here.</p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
             {/* Placeholder link for creating a new discount */}
            <Link
              to="/admin/discounts/new"
              className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
              Add Discount
            </Link>
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {isLoading ? (
                <div className="grid place-items-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                </div>
              ) : isError || !discounts ? ( // Handle error state, check if discounts is null/undefined after loading
                 <div className="text-center py-12 text-red-600">
                     Error loading discounts. {isError ? (error instanceof Error ? error.message : '') : 'Discounts data not available.'}
                 </div>
              ) : discounts.length > 0 ? ( // Check if discounts array is not empty
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Code</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Percentage</th>
                       <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Expiry Date</th> {/* Added expiry date column */}
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {discounts.map((discount) => (
                       // Use discount._id as key
                      <tr key={discount._id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{discount.code}</td>
                        <td className="px-3 py-4 text-sm text-gray-500">{discount.description || 'N/A'}</td> {/* Display description */}
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{discount.percentage}%</td>
                         <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {discount.expiryDate ? new Date(discount.expiryDate).toLocaleDateString() : 'N/A'} {/* Display expiry date */}
                         </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className={clsx(
                            'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
                            {
                              'bg-green-50 text-green-700 ring-green-600/20': discount.isActive,
                              'bg-gray-50 text-gray-600 ring-gray-500/10': !discount.isActive,
                            }
                          )}>
                            {discount.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                           {/* Placeholder link for editing */}
                          <Link to={`/admin/discounts/edit/${discount._id}`} className="text-indigo-600 hover:text-indigo-900">
                            Edit<span className="sr-only">, {discount.code}</span>
                          </Link>
                           {/* Add Delete button similar to Products page if needed */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12"> {/* Empty state */}
                  <p className="text-sm text-gray-500">No discounts found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}