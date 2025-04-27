import { model, Schema, Document } from 'mongoose';
import { User } from '@interfaces/users.interface';
import { EUserRole } from '@/types/user.types';

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
});

const userModel = model<User & Document>('User', userSchema);

export default userModel;
