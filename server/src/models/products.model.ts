import { model, Schema, Document } from 'mongoose';
import { Product } from '@interfaces/products.interface';

const reviewSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const productSchema: Schema = new Schema({
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
  category: {
    type: String,
    required: true,
    index: true,
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/250x150.png?text=No+Image',
  },
  reviews: [reviewSchema],
  totalRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
});

const productModel = model<Product & Document>('Product', productSchema);

export default productModel;
