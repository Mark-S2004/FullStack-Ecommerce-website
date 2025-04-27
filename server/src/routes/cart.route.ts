import { Router } from 'express';
import authMiddleware from '@middlewares/auth.middleware';
import { CartController } from '@controllers/cart.controller';

const router = Router();

router.get('/', authMiddleware, CartController.getCart);          // ✅ View cart
router.post('/update', authMiddleware, CartController.updateCart); // ✅ Update cart
router.post('/clear', authMiddleware, CartController.clearCart);   // ✅ Clear cart

export default {
  path: '/cart',
  router,
};
