// src/services/reviews.service.ts

import { Document, Types } from 'mongoose'; // Import Document, Types as values/types
import { HttpException } from '@exceptions/HttpException';
import productModel from '@models/products.model';
import { isEmpty } from '@utils/util';
import { CreateReviewDto } from '@dtos/reviews.dto';
// Import Review and Product interfaces
import { Review } from '@interfaces/reviews.interface';
import { Product } from '@interfaces/products.interface';


export const addReview = async (productId: string, userId: string, reviewData: CreateReviewDto): Promise<Product> => { // Add return type annotation
  if (isEmpty(reviewData)) throw new HttpException(400, 'reviewData is empty');

  // Validate productId format
   if (!Types.ObjectId.isValid(productId)) {
       throw new HttpException(400, 'Invalid product ID format');
    }
   // Validate userId format
    if (!Types.ObjectId.isValid(userId)) {
        throw new HttpException(400, 'Invalid user ID format');
    }


  // Find product document
  const product = await productModel.findById(productId) as (Product & Document) | null; // Cast result
  if (!product) throw new HttpException(404, 'Product not found');

  // Create new review subdocument object
  const newReview = { user: new Types.ObjectId(userId), rating: reviewData.rating, comment: reviewData.comment }; // Store user as ObjectId

  // Add review to the product's reviews array
  // Cast product.reviews to Mongoose DocumentArray type to use its methods
  (product.reviews as Types.DocumentArray<Review & Document>).push(newReview as Review & Document); // Push the new review object


  product.totalRating = (product.totalRating || 0) + reviewData.rating; // Safely update totalRating
  product.reviewCount = (product.reviewCount || 0) + 1; // Safely update reviewCount
  // Recalculate average rating (optional, might be done on frontend or as a virtual/getter)
  // product.averageRating = product.reviewCount === 0 ? 0 : product.totalRating / product.reviewCount;


  await product.save();
  // Return the updated product as a plain object
  return product.toObject({ getters: true });
};

export const updateReview = async (productId: string, reviewId: string, reviewData: CreateReviewDto): Promise<Product> => { // Add return type annotation
  if (isEmpty(reviewData)) throw new HttpException(400, 'reviewData is empty');

   // Validate productId format
   if (!Types.ObjectId.isValid(productId)) {
       throw new HttpException(400, 'Invalid product ID format');
    }
   // Validate reviewId format
    if (!Types.ObjectId.isValid(reviewId)) {
        throw new HttpException(400, 'Invalid review ID format');
    }

  const product = await productModel.findById(productId) as (Product & Document) | null; // Cast result
  if (!product) throw new HttpException(404, 'Product not found');

  // Find the specific review subdocument by its _id
  // Cast product.reviews to Mongoose DocumentArray type
  const review = (product.reviews as Types.DocumentArray<Review & Document>).id(reviewId);
  if (!review) throw new HttpException(404, 'Review not found');

  // Adjust totalRating before updating the rating
  product.totalRating = (product.totalRating || 0) - review.rating; // Subtract old rating
  review.rating = reviewData.rating; // Update rating
  review.comment = reviewData.comment; // Update comment
  product.totalRating += review.rating; // Add new rating
  // Recalculate average rating (optional)
  // product.averageRating = product.reviewCount === 0 ? 0 : product.totalRating / product.reviewCount;


  await product.save();
  // Return the updated product as a plain object
  return product.toObject({ getters: true });
};

export const deleteReview = async (productId: string, reviewId: string): Promise<Product> => { // Add return type annotation
   // Validate productId format
   if (!Types.ObjectId.isValid(productId)) {
       throw new HttpException(400, 'Invalid product ID format');
    }
   // Validate reviewId format
    if (!Types.ObjectId.isValid(reviewId)) {
        throw new HttpException(400, 'Invalid review ID format');
    }

  const product = await productModel.findById(productId) as (Product & Document) | null; // Cast result
  if (!product) throw new HttpException(404, 'Product not found');

  // Find the specific review subdocument by its _id
  const review = (product.reviews as Types.DocumentArray<Review & Document>).id(reviewId);
  if (!review) throw new HttpException(404, 'Review not found');

  // Adjust totalRating and reviewCount before removing the review
  product.totalRating = (product.totalRating || 0) - review.rating; // Subtract old rating
  product.reviewCount = (product.reviewCount || 0) - 1; // Decrement count
  // Remove the review using Mongoose's .pull() method or .id().remove()
  (product.reviews as Types.DocumentArray<Review & Document>).pull({ _id: new Types.ObjectId(reviewId) }); // Pull the item by its ObjectId _id
  // Recalculate average rating (optional)
  // product.averageRating = product.reviewCount === 0 ? 0 : product.totalRating / product.reviewCount;


  await product.save();
  // Return the updated product as a plain object
  return product.toObject({ getters: true });
};