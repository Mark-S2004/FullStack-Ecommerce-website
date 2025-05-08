import { Router } from 'express';
import { CreateUserDto, loginUserDto } from '@dtos/users.dto';
import validationMiddleware from '@middlewares/validation.middleware';
import * as authController from '@controllers/auth.controller';
import { RequestWithUser } from '@/interfaces/auth.interface'; // Import RequestWithUser

const path = '/auth'; // This is the base path this router will be mounted at in app.ts
const router = Router(); // Create the router

// Define routes relative to the base path ('/auth')
router.post('/signup', validationMiddleware(CreateUserDto, 'body'), authController.signUp); // Full path: /api/auth/signup
router.post('/login', validationMiddleware(loginUserDto, 'body'), authController.logIn); // Full path: /api/auth/login

// '/me' endpoint needs access to req.user set by authMiddleware
router.get('/me', (req: RequestWithUser, res) => {
  if (req.user) {
      res.status(200).json({ role: req.user.role, email: req.user.email }); // Return more info
  } else {
      // Although authRequiredMiddleware will likely catch this first if needsAuth is true,
      // handling it here makes this specific route file more self-contained.
      res.status(401).json({ message: 'Not authenticated' });
  }
}); // Full path: /api/auth/me

router.post('/logout', authController.logOut); // Full path: /api/auth/logout

export default { path, router }; // Export the base path and the configured router