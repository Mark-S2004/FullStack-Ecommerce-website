import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Review {
  _id: string;
  productId: string;
  productName: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const ReviewModeration: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all products with reviews
      const { data } = await axios.get('/api/products/admin/reviews');
      
      if (data.success) {
        // Extract reviews from all products and flatten them
        const allReviews = data.products.flatMap((product: any) => 
          product.reviews.map((review: any) => ({
            ...review,
            productId: product._id,
            productName: product.name
          }))
        );
        
        setReviews(allReviews);
      } else {
        setError('Failed to fetch reviews');
      }
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.response?.data?.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (reviewId: string, productId: string, status: 'approved' | 'rejected') => {
    try {
      setError(null);
      
      const { data } = await axios.put('/api/products/admin/review/moderate', {
        reviewId,
        productId,
        status
      });
      
      if (data.success) {
        // Update the reviews list
        setReviews(reviews.map(review => 
          review._id === reviewId ? { ...review, status } : review
        ));
      } else {
        setError('Failed to moderate review');
      }
    } catch (err: any) {
      console.error('Error moderating review:', err);
      setError(err.response?.data?.message || 'Failed to moderate review');
    }
  };

  const filteredReviews = filter === 'all' 
    ? reviews
    : reviews.filter(review => review.status === filter);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Review Moderation</h2>
        
        <div className="flex items-center">
          <span className="mr-2">Filter:</span>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border rounded p-1"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {filteredReviews.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          No reviews found
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <div 
              key={review._id} 
              className={`border p-4 rounded ${
                review.status === 'pending' ? 'border-yellow-300 bg-yellow-50' : 
                review.status === 'approved' ? 'border-green-300 bg-green-50' : 
                'border-red-300 bg-red-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">
                    Product: <span className="text-blue-600">{review.productName}</span>
                  </h3>
                  <div className="text-sm text-gray-600 mb-1">
                    By: {review.name} | Date: {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg 
                        key={star}
                        className={`w-5 h-5 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    review.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                    review.status === 'approved' ? 'bg-green-200 text-green-800' :
                    'bg-red-200 text-red-800'
                  }`}>
                    {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{review.comment}</p>
              
              <div className="flex justify-end gap-2">
                {review.status !== 'approved' && (
                  <button
                    onClick={() => handleModerate(review._id, review.productId, 'approved')}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Approve
                  </button>
                )}
                
                {review.status !== 'rejected' && (
                  <button
                    onClick={() => handleModerate(review._id, review.productId, 'rejected')}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewModeration; 