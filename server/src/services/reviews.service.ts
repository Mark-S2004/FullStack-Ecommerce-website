// src/services/reviews.service.ts

import { Document, Types } from 'mongoose';
import { HttpException } from '../exceptions/HttpException';
import productModel from '../models/products.model';
import { isEmpty } from '../utils/util';
import { CreateReviewDto } from '../dtos/reviews.dto';
import { Review } from '../interfaces/reviews.interface';

export const addReview = async (productId: string, userId: string, reviewData: CreateReviewDto) => {
  if (isEmpty(reviewData)) throw new HttpException(400, 'reviewData is empty');

  const product = await productModel.findById(productId);
  if (!product) throw new HttpException(404, 'Product not found');

  const newReview = { user: userId, rating: reviewData.rating, comment: reviewData.comment };

  (product.reviews as Types.DocumentArray<Review & Document>).push(newReview);
  product.totalRating += reviewData.rating;
  product.reviewCount += 1;
  // product.averageRating = product.totalRating / product.reviewCount;

  await product.save();
  return product;
};

export const updateReview = async (productId: string, reviewId: string, reviewData: CreateReviewDto) => {
  if (isEmpty(reviewData)) throw new HttpException(400, 'reviewData is empty');

  const product = await productModel.findById(productId);
  if (!product) throw new HttpException(404, 'Product not found');

  const review = (product.reviews as Types.DocumentArray<Review & Document>).id(reviewId);
  if (!review) throw new HttpException(404, 'Review not found');

  // Adjust totalRating before updating
  product.totalRating -= review.rating;
  review.rating = reviewData.rating;
  review.comment = reviewData.comment;
  product.totalRating += reviewData.rating;
  // product.averageRating = product.totalRating / product.reviewCount;

  await product.save();
  return product;
};

export const deleteReview = async (productId: string, reviewId: string) => {
  const product = await productModel.findById(productId);
  if (!product) throw new HttpException(404, 'Product not found');

  const review = (product.reviews as Types.DocumentArray<Review & Document>).id(reviewId);
  if (!review) throw new HttpException(404, 'Review not found');

  product.totalRating -= review.rating;
  product.reviewCount -= 1;
  (product.reviews as Types.DocumentArray<Review & Document>).id(reviewId).remove();
  // product.averageRating = product.reviewCount === 0 ? 0 : product.totalRating / product.reviewCount;

  await product.save();
  return product;
};
