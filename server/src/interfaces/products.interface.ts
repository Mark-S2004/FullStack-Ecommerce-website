import { Review } from './reviews.interface';

export interface Product {
  name: string;
  description: string;
  price: number;
  stock: number;
  reviews: Review[];
  totalRating: number;
  reviewCount: number;
}
