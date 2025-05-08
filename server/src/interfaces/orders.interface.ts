import { Types } from 'mongoose'; // Import Types from mongoose

// Define Product interface here if it's not already in a shared file
// Otherwise, remove this definition and ensure it's imported correctly
export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  gender: 'Men' | 'Women' | 'Unisex';
  sizes?: string[]; // Optional sizes array
  colors?: string[]; // Optional colors array
  images?: string[]; // Optional images array
  reviews?: any[]; // Simplified, could use a more specific Review interface
  totalRating?: number;
  reviewCount?: number;
}


export interface OrderItem {
  _id?: string; // Add optional _id for subdocuments
  product: Types.ObjectId | Product; // Can be ObjectId (stored) or populated Product (fetched)
  qty: number;
  price: number; // Store price at time of order for consistency
  size?: string; // Added size field if it exists in cart/product
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}


export interface Order {
  _id?: string; // Add _id for fetched orders
  user: Types.ObjectId | { _id: string; name: string }; // User reference is ObjectId, can be populated User
  items: OrderItem[];
  shippingAddress: ShippingAddress; // Use the ShippingAddress interface
  shippingCost: number;
  tax: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled'; // Use union type for status
  createdAt: Date;
  orderNumber?: string; // Add optional order number field
}