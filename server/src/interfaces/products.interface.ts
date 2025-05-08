import { Review } from './reviews.interface';

export interface Product {
  _id?: string; // Usually string when coming from Mongoose
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string; // Optional or required based on model
  gender?: string;   // Optional or required based on model
  images?: string[];
  reviews?: Review[]; // Assuming Review interface is defined elsewhere or here
  // For populated reviews with average rating etc.
  reviewCount?: number;
  totalRating?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// You might also want a Review sub-interface if not defined globally
// interface Review {
//   _id?: string;
//   user: string; // or ObjectId, or populated User object
//   rating: number;
//   comment: string;
//   createdAt?: Date;
// }
