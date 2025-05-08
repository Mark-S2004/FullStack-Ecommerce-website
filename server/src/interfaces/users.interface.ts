import { OrderItem } from './orders.interface';
import { Types } from 'mongoose';
import { Product } from './products.interface';

export enum EUserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: EUserRole;
  cart: OrderItem[];
  cartSubtotal?: number;
  appliedDiscountCode?: string;
  discountAmount?: number;
  cartTotalAfterDiscount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartItem {
  product: Types.ObjectId | Product | string;
  qty: number;
  price: number;
  _id?: Types.ObjectId | string;
}
