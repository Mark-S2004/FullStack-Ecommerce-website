import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { CreateUserDto, loginUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import userModel from '@models/users.model';
import { isEmpty } from '@utils/util';

export const signup = async (userData: CreateUserDto): Promise<User> => {
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

export const login = async (userData: loginUserDto): Promise<{ cookie: string; findUser: User }> => {
  if (isEmpty(userData)) {
    throw new HttpException(400, 'userData is empty');
  }

  const findUser: User = await userModel.findOne({ email: userData.email });
  if (!findUser) {
    throw new HttpException(409, `This email ${userData.email} was not found`);
  }

  const isPasswordMatching: boolean = await compare(userData.password, findUser.password);
  if (!isPasswordMatching) {
    throw new HttpException(409, 'Password is not matching');
  }

  const tokenData = createToken(findUser);
  const cookie = createCookie(tokenData);

  return { cookie, findUser };
};

export const logout = async (userData: User): Promise<User> => {
  if (isEmpty(userData)) {
    throw new HttpException(400, 'userData is empty');
  }

  const findUser: User = await userModel.findOne({ email: userData.email, password: userData.password });
  if (!findUser) {
    throw new HttpException(409, `This email ${userData.email} was not found`);
  }

  return findUser;
};

export const createToken = (user: User): TokenData => {
  const dataStoredInToken: DataStoredInToken = { _id: user._id };
  const secretKey: string = SECRET_KEY;
  const expiresIn: number = 60 * 60;

  return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
};

export const createCookie = (tokenData: TokenData): string => {
  return `Authorization=${tokenData.token}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${tokenData.expiresIn};`;
};
