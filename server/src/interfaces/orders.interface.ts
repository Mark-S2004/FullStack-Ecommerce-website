import { Types } from 'mongoose'; // Import Types from mongoose
import { Product } from './products.interface'; // Import Product interface

// Update OrderItem interface to reflect potential product details
export interface OrderItem {
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
  user: Types.ObjectId; // User reference is ObjectId
  items: OrderItem[];
  shippingAddress: ShippingAddress; // Use the new ShippingAddress interface
  shippingCost: number;
  tax: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled'; // Use enum for status
  createdAt: Date;
  orderNumber: string; // Add order number field
}