import { HttpException } from '@exceptions/HttpException';
import reviewModel from '@models/review.model'; // Changed from reviews.model
import productModel from '@models/products.model';
import { Review } from '@interfaces/reviews.interface'; // Assuming you have a review interface

// Find all reviews (potentially populate user/product info)
export const findAllReviews = async (): Promise<Review[]> => {
  const reviews: Review[] = await reviewModel.find()
    .populate('user', 'name email') // Populate user with name and email
    .populate('product', 'name');    // Populate product with name
  return reviews;
};

// Delete a review by its ID
export const deleteReviewById = async (reviewId: string): Promise<Review> => {
  const deletedReview: Review | null = await reviewModel.findByIdAndDelete(reviewId);
  if (!deletedReview) throw new HttpException(404, 'Review not found');

  // Optional: Update the corresponding product's review count and average rating
  // This requires more complex logic to recalculate after deletion
  // await updateProductRatingAfterReviewChange(deletedReview.product); // Placeholder

  return deletedReview;
};

// Placeholder for recalculating product rating (complex - implement if needed)
// async function updateProductRatingAfterReviewChange(productId: string) {
//     // Find all reviews for the product
//     // Calculate new average and count
//     // Update the product document
// } 