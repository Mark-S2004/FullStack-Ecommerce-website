// client/src/utils/productUtils.ts
import { Product } from '@/types/product.types'; // Import the Product interface

export function calculateAverageRating(reviews: Product['reviews']): number {
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}