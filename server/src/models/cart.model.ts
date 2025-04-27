import { Schema, model } from 'mongoose';

const CartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      qty: { type: Number, required: true },
    }
  ],
}, { timestamps: true });

export const CartModel = model('Cart', CartSchema);
