export type ProductCategory = 'denim' | 'tshirt' | 'hoodie' | 'accessory';
export type ProductGender = 'male' | 'female' | 'unisex';

export interface Product {
  id: string;
  _id: string; // MongoDB ObjectId string
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  gender: ProductGender;
  imageUrl: string;
  sizes: string[];
  inStock: boolean;
  stock: number; // Quantity available in stock
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
} 