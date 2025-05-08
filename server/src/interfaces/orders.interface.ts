import { Types } from 'mongoose';
import { User } from './users.interface';
import { Product } from './products.interface';

export interface OrderItem {
  _id?: Types.ObjectId | string;
  product: Types.ObjectId | Product | string;
  qty: number;
  price: number;
}

// export interface ShippingAddress {
//   line1: string;
//   city: string;
//   country: string;
//   postalCode: string;
// }

export enum OrderStatus {
  PENDING = 'Pending',
  PAYMENT_FAILED = 'Payment Failed',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
}

export interface Order {
  _id?: Types.ObjectId | string;
  user: Types.ObjectId | User | string;
  items: OrderItem[];
  shippingAddress: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;

  subtotal: number;
  discountCode?: string;
  discountAmount?: number;
  totalAfterDiscount: number;
  shippingFee?: number;
  taxAmount?: number;
  grandTotal: number;

  status?: OrderStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
