import mongoose from 'mongoose';

export interface IDiscount extends mongoose.Document {
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxUses: number;
  usedCount: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableProducts: mongoose.Schema.Types.ObjectId[];
  createdAt: Date;
}

const discountSchema = new mongoose.Schema<IDiscount>({
  code: {
    type: String,
    required: [true, 'Please enter discount code'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  description: {
    type: String,
    required: [true, 'Please enter discount description'],
  },
  discountType: {
    type: String,
    required: [true, 'Please specify discount type'],
    enum: ['percentage', 'fixed'],
  },
  value: {
    type: Number,
    required: [true, 'Please enter discount value'],
    min: [0, 'Discount value cannot be negative'],
  },
  minPurchase: {
    type: Number,
    default: 0,
    min: [0, 'Minimum purchase amount cannot be negative'],
  },
  maxUses: {
    type: Number,
    default: 0, // 0 means unlimited
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  validFrom: {
    type: Date,
    default: Date.now,
  },
  validUntil: {
    type: Date,
    required: [true, 'Please specify expiration date'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  applicableProducts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IDiscount>('Discount', discountSchema); 