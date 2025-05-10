import { NextFunction, Request, Response } from 'express';
import { CreateUserDto, loginUserDto } from '../dtos/users.dto';
import { RequestWithUser } from '../interfaces/auth.interface';
import { User } from '../interfaces/users.interface';
import * as authService from '../services/auth.service';

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData: CreateUserDto = req.body;
    const signUpUserData: User = await authService.signup(userData);

    res.status(201).json({ data: signUpUserData, message: 'signup' });
  } catch (error) {
    next(error);
  }
};

export const logIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData: loginUserDto = req.body;
    const { cookie, findUser } = await authService.login(userData);

    res.setHeader('Set-Cookie', [cookie]);
    res.status(200).json({ data: findUser, message: 'login' });
  } catch (error) {
    next(error);
  }
};

export const logOut = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const userData: User = req.user;
    const logOutUserData: User = await authService.logout(userData);

    res.setHeader('Set-Cookie', ['Authorization=; HttpOnly; Secure; SameSite=None; Path=/; Max-age=0']);
    res.status(200).json({ data: logOutUserData, message: 'logout' });
  } catch (error) {
    next(error);
  }
};
