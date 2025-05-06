import { Router } from 'express';
import { CreateUserDto, loginUserDto } from '@dtos/users.dto';
import authMiddleware from '@middlewares/auth.middleware';
import validationMiddleware from '@middlewares/validation.middleware';
import * as authController from '@controllers/auth.controller';

const path = '/auth';
const router = Router();

router.post(`${path}/signup`, validationMiddleware(CreateUserDto, 'body'), authController.signUp);
router.post(`${path}/login`, validationMiddleware(loginUserDto, 'body'), authController.logIn);
router.get(`${path}/me`, authMiddleware, (req: any, res) => {
  res.json({ role: req.user.role });
});
router.post(`${path}/logout`, authMiddleware, authController.logOut);

export default { path, router };
