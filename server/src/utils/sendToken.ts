import { Response } from 'express';
import { IUser } from '../models/userModel';

// Send JWT token, set cookie, and return user data
const sendToken = (user: IUser, statusCode: number, res: Response) => {
  // Create token
  const token = user.getJWTToken();

  // Cookie options
  const cookieExpire = process.env.COOKIE_EXPIRE 
    ? parseInt(process.env.COOKIE_EXPIRE) 
    : 7;
  
  const options = {
    expires: new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only https
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' as 'none' | 'lax' | 'strict',
  };

  // Remove password from response
  const { password, ...userWithoutPassword } = user.toObject();

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: userWithoutPassword,
    });
};

export default sendToken; 