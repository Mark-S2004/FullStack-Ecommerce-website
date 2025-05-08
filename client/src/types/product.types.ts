// client/src/types/product.types.ts
// This file defines the structure of data as the CLIENT expects to receive it from the API.

// Define the structure for a populated user object in a review
export interface PopulatedUserInReview {
  _id: string; // User ID string (as sent by API)
  name: string; // User name
  // Add other user fields if populated and sent by the API
}

// Define the Review interface as received by the client API
// It should NOT extend Mongoose Document
export interface Review {
  _id?: string; // Review ID string (as sent by API)
  user: PopulatedUserInReview; // User is populated and sent as a plain object
  rating: number;
  comment: string;
  createdAt: string; // Date string (ISO format)
}

// Define the Product interface as received by the client API
// It should NOT extend Mongoose Document
export interface Product {
  _id?: string; // Product ID string (as sent by API)
  name: string;
  description: string;
  price: number;
  stock: number; // Stock count is available
  category: string;
  gender: 'Men' | 'Women' | 'Unisex';
  sizes: string[]; // Array of strings
  colors: string[]; // Array of strings
  images: string[]; // Array of strings (URLs)
  reviews: Review[]; // Array of Review objects (using the plain Review interface)
  totalRating: number; // Total sum of ratings (as sent by API)
  reviewCount: number; // Number of reviews (as sent by API)
}

// PopulatedCartItem and CartTotals interfaces are defined and exported in client/src/contexts/CartContext.tsx

// No default export needed if only exporting interfaces