import { Router } from 'express';
import * as usersController from '@controllers/users.controller';
import { CreateUserDto } from '@dtos/users.dto';
import validationMiddleware from '@middlewares/validation.middleware';

const path = '/users';
const router = Router();

router.get(`${path}`, usersController.getUsers);
router.get(`${path}/:id`, usersController.getUserById);
router.post(`${path}`, validationMiddleware(CreateUserDto, 'body'), usersController.createUser);
router.put(`${path}/:id`, validationMiddleware(CreateUserDto, 'body', true), usersController.updateUser);
router.delete(`${path}/:id`, usersController.deleteUser);

export default { path, router };
