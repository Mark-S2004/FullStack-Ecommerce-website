// server/src/interfaces/discounts.interface.ts
import { Types } from 'mongoose';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixedAmount', // Amount in cents
}

export interface Discount {
  _id?: Types.ObjectId | string;
  code: string;
  description?: string;
  discountType: DiscountType;
  value: number;
  isActive?: boolean;
  validFrom?: Date;
  validTo?: Date;
  minPurchase?: number; // In cents
  applicableProducts?: (Types.ObjectId | string)[]; // Array of Product ObjectIds
  applicableCategories?: string[];
  usageLimit?: number;
  timesUsed?: number;
  createdAt?: Date;
  updatedAt?: Date;
} 