import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const router = Router();

router.post('/', ProductController.create);
router.get('/', ProductController.list);
router.get('/:id', ProductController.getById);
router.put('/:id', ProductController.update);
router.delete('/:id', ProductController.remove);

export default router;
