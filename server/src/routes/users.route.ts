import { Router } from 'express';
import { CreateUserDto } from '@dtos/users.dto';
import validationMiddleware from '@middlewares/validation.middleware';
import * as usersController from '@controllers/users.controller';

const path = '/users'; // This is the base path for user-related routes
const router = Router(); // Create the router

// Define routes relative to the base path ('/users')
// Note: These will hit authRequiredMiddleware in app.ts if needsAuth is true for this route
router.get('/', usersController.getUsers); // Full path: /api/users
router.get('/:id', usersController.getUserById); // Full path: /api/users/:id
router.post('/', validationMiddleware(CreateUserDto, 'body'), usersController.createUser); // Full path: /api/users
router.put('/:id', validationMiddleware(CreateUserDto, 'body', true), usersController.updateUser); // Full path: /api/users/:id
router.delete('/:id', usersController.deleteUser); // Full path: /api/users/:id

export default { path, router };