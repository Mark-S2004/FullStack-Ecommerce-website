import { hash } from 'bcrypt';
import { CreateUserDto } from '../dtos/users.dto';
import { HttpException } from '../exceptions/HttpException';
import { User } from '../interfaces/users.interface';
import userModel from '../models/users.model';
import { isEmpty } from '../utils/util';

export const findAllUser = async (): Promise<User[]> => {
  const users: User[] = await userModel.find();
  return users;
};

export const findUserById = async (userId: string): Promise<User> => {
  if (isEmpty(userId)) {
    throw new HttpException(400, 'UserId is empty');
  }

  const findUser: User = await userModel.findOne({ _id: userId });
  if (!findUser) {
    throw new HttpException(409, "User doesn't exist");
  }

  return findUser;
};

export const createUser = async (userData: CreateUserDto): Promise<User> => {
  if (isEmpty(userData)) {
    throw new HttpException(400, 'userData is empty');
  }

  const findUser: User = await userModel.findOne({ email: userData.email });
  if (findUser) {
    throw new HttpException(409, `This email ${userData.email} already exists`);
  }

  const hashedPassword = await hash(userData.password, 10);
  const createUserData: User = await userModel.create({ ...userData, password: hashedPassword });

  return createUserData;
};

export const updateUser = async (userId: string, userData: CreateUserDto): Promise<User> => {
  console.log('[DEBUG] updateUser called with userId:', userId);
  console.log('[DEBUG] userData received:', JSON.stringify(userData, null, 2));
  
  if (isEmpty(userData)) {
    throw new HttpException(400, 'userData is empty');
  }

  try {
    if (userData.email) {
      const findUser: User = await userModel.findOne({ email: userData.email });
      if (findUser && findUser._id != userId) {
        throw new HttpException(409, `This email ${userData.email} already exists`);
      }
    }

    if (userData.password) {
      const hashedPassword = await hash(userData.password, 10);
      userData = { ...userData, password: hashedPassword };
      console.log('[DEBUG] Password hashed for update');
    }

    console.log('[DEBUG] About to update user with data:', JSON.stringify(userData, null, 2));
    const updateUserById: User = await userModel.findByIdAndUpdate(userId, userData, { new: true });
    
    if (!updateUserById) {
      console.log('[DEBUG] User not found for ID:', userId);
      throw new HttpException(409, "User doesn't exist");
    }
    
    console.log('[DEBUG] User updated successfully:', updateUserById._id);
    return updateUserById;
  } catch (error) {
    console.error('[DEBUG] Error in updateUser:', error.message, error.stack);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<User> => {
  const deleteUserById: User = await userModel.findByIdAndDelete(userId);
  if (!deleteUserById) {
    throw new HttpException(409, "User doesn't exist");
  }

  return deleteUserById;
};
