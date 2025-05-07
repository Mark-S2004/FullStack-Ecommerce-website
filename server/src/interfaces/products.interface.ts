import { Review } from './reviews.interface';

export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  gender: 'Men' | 'Women' | 'Unisex';
  sizes: string[];
  colors: string[];
  images: string[];
  reviews: Review[];
  totalRating: number;
  reviewCount: number;
}
