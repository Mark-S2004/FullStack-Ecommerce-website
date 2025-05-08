// server/src/interfaces/reviews.interface.ts
import { Types } from 'mongoose'; // Import Types

// Define the Review interface
export interface Review {
  _id?: Types.ObjectId; // Use Mongoose ObjectId type
  user: Types.ObjectId; // Store user as ObjectId reference
  rating: number;
  comment: string;
  createdAt?: Date;
}