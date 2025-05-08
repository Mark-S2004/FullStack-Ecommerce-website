// server/src/models/products.model.ts
import { model, Schema, Document, Types } from 'mongoose'; // Import Types and Document
// Import the Product interface from the new location
import { Product } from '@interfaces/products.interface'; // Correct import path for Product
// Import the Review interface
import { Review } from '@interfaces/reviews.interface'; // Import Review

// Using the imported Review interface for the schema definition
const reviewSchema: Schema<Review> = new Schema({ // Add type parameter for Schema
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Using the imported Product interface for the schema definition
const productSchema: Schema<Product> = new Schema({ // Add type parameter for Schema
  name: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    trim: true,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  },
  category: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Men', 'Women', 'Unisex'],
    required: true,
  },
  sizes: {
    type: [String],
    default: [],
  },
  colors: {
    type: [String],
    default: [],
  },
  images: {
    type: [String],
    default: [],
  },
  // Use the defined reviewSchema for the reviews array
  reviews: [reviewSchema],
  totalRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
});

// Use ProductDocument type for the model
const productModel = model<Product>('Product', productSchema); // Simplified type parameter

export default productModel;