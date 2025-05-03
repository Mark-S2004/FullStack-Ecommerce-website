import { Router } from 'express';
import { CreateUserDto, loginUserDto } from '@dtos/users.dto';
import authMiddleware from '@middlewares/auth.middleware';
import validationMiddleware from '@middlewares/validation.middleware';
import * as authController from '@controllers/auth.controller';

const path = '/auth'; // Define the base path for this router
const router = Router();

// Define routes relative to this router's base path
router.post(`/signup`, validationMiddleware(CreateUserDto, 'body'), authController.signUp);
router.post(`/login`, validationMiddleware(loginUserDto, 'body'), authController.logIn);

// Route to get the currently authenticated user
router.get(`/me`, authMiddleware, (req, res) => {
  // req.user should be populated by authMiddleware
  if (!req.user) {
    return res.status(404).json({ message: 'User not found or token invalid' });
  }
  // Respond with user data, wrapped in a 'data' object for consistency
  res.json({ data: req.user }); 
});

router.post(`/logout`, authMiddleware, authController.logOut);

// Export the path and router, consistent with other route files
export default { path, router }; 
