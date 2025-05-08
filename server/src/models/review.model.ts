import { model, Schema, Document } from 'mongoose';
import { Review } from '@interfaces/reviews.interface';
import { Product } from '@interfaces/products.interface'; // For type referencing
import { User } from '@interfaces/users.interface'; // For type referencing

const reviewSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  },
);

// You might want to add a compound index for user/product to prevent duplicate reviews
// reviewSchema.index({ user: 1, product: 1 }, { unique: true });

const reviewModel = model<Review & Document>('Review', reviewSchema);

export default reviewModel; 