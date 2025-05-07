import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Helmet } from 'react-helmet-async';
import { StarIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

// TODO: Define a proper Review interface based on backend data
interface Review {
  _id: string;
  user: { name: string };
  product: { name: string; _id: string };
  rating: number;
  comment: string;
  createdAt: string;
  // Add other relevant fields like status (approved/pending) if applicable
}

export default function AdminReviews() {
  // Fetch Reviews - Assuming endpoint /api/reviews
  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/reviews');
        return data.reviews || []; // Adjust based on actual API response structure
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
        // Optionally show a toast error
        return []; // Return empty array on error
      }
    },
  });

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
              ) : reviews && reviews.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">User</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Product</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Rating</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Comment</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reviews.map((review) => (
                      <tr key={review._id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{review.user.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{review.product.name}</td>
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
                        <td className="px-3 py-4 text-sm text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-xs">{review.comment}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          {/* Add buttons for Approve/Delete actions if needed */}
                           <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12">
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