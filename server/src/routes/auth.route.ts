import { Router } from 'express';
import { CreateUserDto, loginUserDto } from '@dtos/users.dto';
import validationMiddleware from '@middlewares/validation.middleware';
import * as authController from '@controllers/auth.controller';

const path = '/auth';
const router = Router();

router.post(`${path}/signup`, validationMiddleware(CreateUserDto, 'body'), authController.signUp);
router.post(`${path}/login`, validationMiddleware(loginUserDto, 'body'), authController.logIn);
router.get(`${path}/me`, (req, res) => {
  res.json({ role: req.user.role });
});
router.post(`${path}/logout`, authController.logOut);

export default { path, router };
