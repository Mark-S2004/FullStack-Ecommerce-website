// client/src/types/product.types.ts
// Define the Product interface here
export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    gender: string;
    images: string[];
    inStock: boolean;
    stock: number; // Assuming stock count is available
    sizes: string[];
    colors: string[];
    reviews: Array<{
      _id: string;
      rating: number;
      comment: string;
      user: { // Assuming user details are populated for reviews
        _id: string; // User ID
        name: string;
      };
      createdAt: string;
    }>;
     // averageRating: number; // Calculated on frontend
     // reviewCount: number; // Derived from reviews.length
  }