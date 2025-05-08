import { model, Schema, Document } from 'mongoose';
import { User } from '../interfaces/users.interface';
import { EUserRole } from '../interfaces/users.interface';

const userSchema: Schema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    lowercase: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(EUserRole),
    required: true,
    index: true,
    // default: EUserRole.STUDENT,if you add a default => gives error for all fields != default
  },
  cart: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      qty: { type: Number, required: true, default: 1 },
      price: { type: Number, required: true, default: 0 },
    },
  ],
  cartSubtotal: { type: Number, default: 0 },
  appliedDiscountCode: { type: String, trim: true },
  discountAmount: { type: Number, default: 0 },
  cartTotalAfterDiscount: { type: Number, default: 0 },
});

const userModel = model<User & Document>('User', userSchema);

export default userModel;
