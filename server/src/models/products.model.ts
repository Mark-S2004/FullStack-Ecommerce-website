import { model, Schema, Document } from 'mongoose';
import { Product } from '@interfaces/products.interface';

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
});

const productModel = model<Product & Document>('Product', productSchema);

export default productModel;
