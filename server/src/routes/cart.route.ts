
import { Router } from 'express';
import { CartController } from '@controllers/cart.controller';
import authMiddleware from '@middlewares/auth.middleware';

const router = Router();

// Optional: Tiny helper to avoid repeating async/try/catch everywhere
const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get('/', authMiddleware, asyncHandler(CartController.getCart));
router.put('/', authMiddleware, asyncHandler(CartController.updateCart));
router.delete('/', authMiddleware, asyncHandler(CartController.clearCart));

export default router;

