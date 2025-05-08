import { hash } from 'bcrypt';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import userModel from '@models/users.model';
import { isEmpty } from '@utils/util';
// Import Types for ObjectId
import { Types, Document } from 'mongoose'; // Import Types and Document


export const findAllUser = async (): Promise<User[]> => {
  const users: User[] = await userModel.find();
  return users;
};

export const findUserById = async (userId: string): Promise<User> => {
  if (isEmpty(userId)) {
    throw new HttpException(400, 'UserId is empty');
  }
   // Validate userId format
   if (!Types.ObjectId.isValid(userId)) {
       throw new HttpException(400, 'Invalid user ID format');
    }

  // Find user by ObjectId _id
  const findUser = await userModel.findById(userId) as (User & Document) | null; // Find by _id, cast the result
  if (!findUser) {
    throw new HttpException(404, "User doesn't exist"); // Use 404 for not found
  }

  return findUser.toObject({ getters: true }); // Return as plain object
};

export const createUser = async (userData: CreateUserDto): Promise<User> => {
  if (isEmpty(userData)) {
    throw new HttpException(400, 'userData is empty');
  }

  const findUser = await userModel.findOne({ email: userData.email }); // Result can be null
  if (findUser) {
    throw new HttpException(409, `This email ${userData.email} already exists`);
  }

  const hashedPassword = await hash(userData.password, 10);
  const createUserData = await userModel.create({ ...userData, password: hashedPassword }) as User & Document; // Cast the result

  return createUserData.toObject({ getters: true }); // Return as plain object
};

export const updateUser = async (userId: string, userData: CreateUserDto): Promise<User> => {
  if (isEmpty(userData)) {
    throw new HttpException(400, 'userData is empty');
  }

   // Validate userId format
   if (!Types.ObjectId.isValid(userId)) {
       throw new HttpException(400, 'Invalid user ID format');
    }

  if (userData.email) {
    const findUser = await userModel.findOne({ email: userData.email }); // Result can be null
    // Compare IDs as strings
    if (findUser && findUser._id.toString() !== userId) {
      throw new HttpException(409, `This email ${userData.email} already exists`);
    }
  }

  let updateData: any = { ...userData }; // Copy data for updates
  if (userData.password) {
    const hashedPassword = await hash(userData.password, 10);
    updateData.password = hashedPassword; // Update password in the copy
  } else {
      // If password is not provided in DTO, remove it from updateData to prevent setting null/undefined
      delete updateData.password;
  }


  const updateUserById = await userModel.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true }) as (User & Document) | null; // Use $set, Find and update by ID, result can be null, cast the result
  if (!updateUserById) {
    throw new HttpException(404, "User doesn't exist"); // Use 404 for not found
  }

  return updateUserById.toObject({ getters: true }); // Return as plain object
};

export const deleteUser = async (userId: string): Promise<User> => {
   // Validate userId format
   if (!Types.ObjectId.isValid(userId)) {
       throw new HttpException(400, 'Invalid user ID format');
    }
  // Find and delete by ID, result can be a User Document or null
  const deleteUserById = await userModel.findByIdAndDelete(userId) as (User & Document) | null; // Cast the result
  if (!deleteUserById) {
    throw new HttpException(404, "User doesn't exist"); // Use 404 for not found
  }

  return deleteUserById.toObject({ getters: true }); // Return as plain object
};