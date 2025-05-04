import { Schema, model } from 'mongoose';

interface IProduct {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: 'denim' | 'tshirt' | 'hoodie' | 'accessory';
  gender: 'male' | 'female' | 'unisex';
  sizes: string[];
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  category: { type: String, enum: ['denim', 'tshirt', 'hoodie', 'accessory'], required: true },
  gender: { type: String, enum: ['male', 'female', 'unisex'], required: true },
  sizes: { type: [String], required: true },
  stock: { type: Number, required: true },
}, {
  timestamps: true,
});

export const Product = model<IProduct>('Product', productSchema); 