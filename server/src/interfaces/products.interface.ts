import { Review } from './reviews.interface';

export interface Product {
  _id?: string; // Mongoose assigns _id
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;       // Optional: Stores price before discount
  discountPercentage?: number;  // Optional: Discount in percentage (0-100)
  stock: number;
  imageUrl?: string;
  reviews?: Review[];
  reviewCount?: number;
  totalRating?: number;
  // If using virtuals for averageRating, ensure they are handled if needed client-side
}
