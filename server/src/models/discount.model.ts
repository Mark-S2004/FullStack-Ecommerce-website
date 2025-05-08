// server/src/models/discount.model.ts
import { model, Schema, Document } from 'mongoose';
import { Discount } from '@interfaces/discounts.interface';

const discountSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
    },
    discountType: {
      type: String,
      required: true,
      enum: ['percentage', 'fixedAmount'], // Amount in cents for fixed
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    validFrom: {
      type: Date,
    },
    validTo: {
      type: Date,
    },
    minPurchase: { // Minimum cart subtotal (before this discount) to apply, in cents
      type: Number,
      default: 0,
    },
    applicableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    applicableCategories: [
      {
        type: String,
        trim: true,
      },
    ],
    usageLimit: { // Max number of times this coupon can be used in total
      type: Number,
      min: 0,
    },
    timesUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster code lookup
discountSchema.index({ code: 1 });
discountSchema.index({ isActive: 1, validFrom: 1, validTo: 1 });

const discountModel = model<Discount & Document>('Discount', discountSchema);

export default discountModel; 