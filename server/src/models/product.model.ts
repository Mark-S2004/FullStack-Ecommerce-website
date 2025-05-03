import { Schema, model } from 'mongoose';

const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: String, enum: ['Footwear', 'Accessories', 'Clothing', 'Electronics', 'Home Goods', 'denim', 'quarter-zip'], required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Unisex', 'male', 'female', 'unisex'], required: true },
  sizes: [String],
  imageUrl: String,
  stock: { type: Number, default: 0 },
}, { timestamps: true });

export const ProductModel = model('Product', ProductSchema);
