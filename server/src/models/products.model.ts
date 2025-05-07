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
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: false,
  },
  reviews: [reviewSchema],
  totalRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
});

const productModel = model<Product & Document>('Product', productSchema);

export default productModel;
