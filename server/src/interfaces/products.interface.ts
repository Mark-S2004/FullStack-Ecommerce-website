// server/src/interfaces/products.interface.ts
import { Review } from './reviews.interface'; // Import the Review interface
import { Types, Document } from 'mongoose'; // Import Types and Document

// Define the Product interface, including review-related fields
export interface Product {
  _id?: Types.ObjectId; // Use Mongoose ObjectId type
  name: string;
  description: string;
  price: number;
  stock: number; // Assuming stock count is available
  category: string;
  gender: 'Men' | 'Women' | 'Unisex';
  sizes: string[]; // Array of strings for sizes
  colors: string[]; // Array of strings for colors
  images: string[]; // Array of strings for image URLs
  reviews: Review[]; // Array of Review objects (when populated)
  totalRating: number; // Total sum of ratings
  reviewCount: number; // Count of reviews
}

// Define the Product Document type for use with Mongoose models
export type ProductDocument = Product & Document;