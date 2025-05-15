import { Router, Request, Response, NextFunction } from 'express';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import authRequiredMiddleware from '@middlewares/authRequired.middleware';
import * as cartController from '@controllers/cart.controller';
import { CreateCartItemDto } from '@dtos/cart.dto';

const path = '/cart'; // Base path for cart routes
const router = Router(); // Create the router

// Temporary logging middleware
const logCartBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log('=============================================');
  console.log('INCOMING /api/cart REQUEST BODY:');
  console.log('Raw req.body:', JSON.stringify(req.body, null, 2));
  if (req.body && typeof req.body.productId !== 'undefined') {
    console.log('Type of req.body.productId:', typeof req.body.productId);
    console.log('Value of req.body.productId:', req.body.productId);
  } else {
    console.log('req.body.productId is undefined or req.body is not set.');
  }
  console.log('=============================================');
  next();
};

// Mount auth middleware for all cart routes that are defined below this line using this router instance.
router.use(authRequiredMiddleware);

// Define routes relative to the base path ('/cart')
router.get('/', cartController.getCart); // Full path: /api/cart
router.post('/', logCartBodyMiddleware, validationMiddleware(CreateCartItemDto, 'body'), cartController.addToCart); // Full path: /api/cart
router.put('/', validationMiddleware(CreateCartItemDto, 'body', true), cartController.updateCart); // Full path: /api/cart
router.delete('/:productId', cartController.removeFromCart); // Full path: /api/cart/:productId

export default { path, router };