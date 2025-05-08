import { Types, Document } from 'mongoose'; // Import Types and Document
// Correct import for Product interface
import { Product } from './products.interface'; // Import Product from its new location


export interface OrderItem {
  _id?: Types.ObjectId; // Add optional _id for subdocuments
  product: Types.ObjectId; // Store product as ObjectId reference
  quantity: number; // Changed from qty to quantity for consistency
  price: number; // Store price at time of order
  size?: string; // Added size field
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


// Order interface for data fetched from DB (potentially populated)
export interface Order {
  _id: Types.ObjectId; // Order _id
  user: Types.ObjectId | { _id: string; name: string }; // User reference is ObjectId, can be populated User object
  items: Array<OrderItem & { product: Product & Document }>; // When fetching orders, items.product is populated
  shippingAddress: ShippingAddress; // Use the ShippingAddress interface
  shippingCost: number;
  tax: number;
  total: number;
  // Added 'Processing' to the enum
  status: 'Pending' | 'Processing' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled'; // Use union type for status
  createdAt: Date;
  orderNumber?: string; // Add optional order number field
}

// Define the Order Document type for use with Mongoose models
export type OrderDocument = Order & Document;