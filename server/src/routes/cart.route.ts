import { Router } from 'express';
import * as cartController from '@controllers/cart.controller';
import { CreateCartItemDto } from '@/dtos/cart.dto';
import validationMiddleware from '@middlewares/validation.middleware';

const path = '/cart';
const router = Router();

router.get(`${path}`, cartController.getCart);
router.post(`${path}`, validationMiddleware(CreateCartItemDto, 'body'), cartController.addToCart);
router.put(`${path}`, validationMiddleware(CreateCartItemDto, 'body', true), cartController.updateCart);
router.delete(`${path}/:productId`, cartController.removeFromCart);

export default { path, router };
