import { model, Schema, Document, Types } from 'mongoose'; // Import Types
import { User } from '@interfaces/users.interface';
import { EUserRole } from '@interfaces/users.interface';
// Import OrderItem interface
import { OrderItem } from '@interfaces/orders.interface';


// Add type parameter for Schema
const userSchema: Schema<User> = new Schema({
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
  // Use OrderItem schema structure for cart items, ensure 'quantity' field
  cart: [
    {
      product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, default: 1 }, // Changed from qty to quantity
      price: { type: Number, required: true, default: 0 },
      size: { type: String } // Added size field
    },
  ],
});

const userModel = model<User & Document>('User', userSchema); // Add type parameter

export default userModel;