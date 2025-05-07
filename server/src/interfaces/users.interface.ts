import { OrderItem } from './orders.interface';

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
}
