import { Router } from 'express';
import * as cartController from '@controllers/cart.controller';
import { CreateCartItemDto } from '@/dtos/cart.dto';
import validationMiddleware from '@middlewares/validation.middleware';

const path = '/cart'; // Base path for cart routes
const router = Router(); // Create the router

// Define routes relative to the base path ('/cart')
// These will hit authRequiredMiddleware in app.ts if needsAuth is true for this route
router.get('/', cartController.getCart); // Full path: /api/cart
router.post('/', validationMiddleware(CreateCartItemDto, 'body'), cartController.addToCart); // Full path: /api/cart
router.put('/', validationMiddleware(CreateCartItemDto, 'body', true), cartController.updateCart); // Full path: /api/cart
router.delete('/:productId', cartController.removeFromCart); // Full path: /api/cart/:productId

export default { path, router };