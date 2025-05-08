import { Router } from 'express';
import * as cartController from '@controllers/cart.controller';
import authRequiredMiddleware from '@middlewares/authRequired.middleware';
import validationMiddleware from '@middlewares/validation.middleware';
import { CartItemDto } from '@dtos/cart.dto'; // Assuming a DTO for adding/updating items

const path = '/cart';
const router = Router();

// Apply auth middleware to all cart routes
router.use(path, authRequiredMiddleware);

// Routes for managing cart items & general cart state
router.get(`${path}`, cartController.getCart); // Get current user cart
router.post(`${path}/item`, validationMiddleware(CartItemDto, 'body'), cartController.addOrUpdateItemInCart); // Add or update item quantity
router.delete(`${path}/item/:productId`, cartController.removeItemFromCart); // Remove specific item
router.delete(`${path}`, cartController.clearCartHandler); // Clear entire cart

// Routes for cart discount management
router.post(`${path}/discount`, cartController.applyDiscountHandler);    // POST /api/cart/discount
router.delete(`${path}/discount`, cartController.removeDiscountHandler); // DELETE /api/cart/discount

export default { path, router };