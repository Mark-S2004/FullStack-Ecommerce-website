import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@dtos/users.dto';
import { User } from '@interfaces/users.interface';
import * as userService from '@services/users.service';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const findAllUsersData: User[] = await userService.findAllUser();

    res.status(200).json({ data: findAllUsersData, message: 'findAll' });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId: string = req.params.id;
    const findOneUserData: User = await userService.findUserById(userId);

    res.status(200).json({ data: findOneUserData, message: 'findOne' });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userData: CreateUserDto = req.body;
    const createUserData: User = await userService.createUser(userData);

    res.status(201).json({ data: createUserData, message: 'created' });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId: string = req.params.id;
    const userData: CreateUserDto = req.body;
    const updateUserData: User = await userService.updateUser(userId, userData);

    res.status(200).json({ data: updateUserData, message: 'updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId: string = req.params.id;
    const deleteUserData: User = await userService.deleteUser(userId);

    res.status(200).json({ data: deleteUserData, message: 'deleted' });
  } catch (error) {
    next(error);
  }
};
