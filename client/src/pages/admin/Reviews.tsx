import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Helmet } from 'react-helmet-async';
import { StarIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
// Optional: Import mutation hooks if adding approve/delete functionality
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import toast from 'react-hot-toast';


// Define a proper Review interface based on backend data (populated for admin view)
interface Review {
  _id: string;
  user: { _id: string; name: string }; // Populated user details
  product: { _id: string; name: string }; // Populated product details
  rating: number;
  comment: string;
  createdAt: string;
  // Add other relevant fields like status (approved/pending) if applicable
   status?: 'Pending' | 'Approved' | 'Rejected'; // Example status field
}

export default function AdminReviews() {
  // Optional: Get query client if adding mutations
  // const queryClient = useQueryClient();

  // Fetch Reviews from backend admin route
  const { data: reviewsResponse, isLoading, isError, error } = useQuery<{ reviews: Review[] }>({ // Expecting { reviews: [...] }
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      try {
         const { data } = await api.get('/admin/reviews'); // Assuming the admin reviews route is /admin/reviews
         console.log('Admin Reviews API response:', data);
         if (!data || !data.data || !data.data.reviews) {
            console.error('Invalid Admin Reviews API response format:', data);
            throw new Error("Invalid data format from API");
         }
         return data.data; // Return data.data which contains { reviews: [...] }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
         throw error;
      }
    },
     retry: false,
  });

   // Access the reviews array from the response data
   const reviews = reviewsResponse?.reviews;

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
        <title>Admin - Reviews | Store</title>
      </Helmet>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold leading-6 text-gray-900">Reviews Management</h1>
            <p className="mt-2 text-sm text-gray-700">Monitor and manage product reviews here.</p>
          </div>
          {/* Add button for actions if needed (e.g., bulk approve/delete) */}
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {isLoading ? (
                <div className="grid place-items-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                </div>
              ) : isError || !reviews ? ( // Handle error state
                 <div className="text-center py-12 text-red-600">
                     Error loading reviews. {isError ? (error instanceof Error ? error.message : '') : ''}
                 </div>
              ) : reviews.length > 0 ? ( // Check if reviews array is not empty
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">User</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Product</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rating</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Comment</th>
                       {/* Optional Status Column */}
                       {/* <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th> */}
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reviews.map((review) => (
                       // Use review._id as key
                      <tr key={review._id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{review.user?.name || 'Anonymous'}</td> {/* Use optional chaining */}
                         <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{review.product?.name || 'Unknown Product'}</td> {/* Use optional chaining */}
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                           <div className="flex items-center">
                              {[0, 1, 2, 3, 4].map((rating) => (
                                <StarIcon
                                  key={rating}
                                  className={clsx(
                                    review.rating > rating ? 'text-yellow-400' : 'text-gray-300',
                                    'h-4 w-4 flex-shrink-0'
                                  )}
                                  aria-hidden="true"
                                />
                              ))}
                            </div>
                        </td>
                         <td className="px-3 py-4 text-sm text-gray-500 max-w-xs overflow-hidden text-ellipsis">{review.comment}</td> {/* Allow comment to wrap or truncate */}
                        {/* Optional Status Cell */}
                       {/* <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                           <span className={clsx(
                             'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset capitalize',
                             {
                               'bg-yellow-50 text-yellow-800 ring-yellow-600/20': review.status === 'Pending',
                               'bg-green-50 text-green-700 ring-green-600/20': review.status === 'Approved',
                               'bg-red-50 text-red-700 ring-red-600/20': review.status === 'Rejected',
                             }
                           )}>
                             {review.status || 'N/A'}
                           </span>
                         </td> */}
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          {/* Add buttons for Approve/Delete actions if needed */}
                           {/* <button className="text-indigo-600 hover:text-indigo-900 mr-3">Approve</button> */}
                           {/* <button 
                                onClick={() => deleteMutation.mutate(review._id)} 
                                className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={deleteMutation.isPending} // Disable while any delete is pending
                            >
                                Delete
                            </button> */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12"> {/* Empty state */}
                  <p className="text-sm text-gray-500">No reviews found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}