import { Router } from 'express';
import * as cartController from '@controllers/cart.controller';
import { CreateCartItemDto } from '@/dtos/cart.dto';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '@middlewares/auth.middleware';

const path = '/cart';
const router = Router();

router.get(`${path}`, authMiddleware, cartController.getCart);
router.post(`${path}`, authMiddleware, validationMiddleware(CreateCartItemDto, 'body'), cartController.addToCart);
router.put(`${path}`, authMiddleware, validationMiddleware(CreateCartItemDto, 'body', true), cartController.updateCart);
router.delete(`${path}/:productId`, authMiddleware, cartController.removeFromCart);

export default { path, router };
