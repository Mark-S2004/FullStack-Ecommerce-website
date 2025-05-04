import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const adminController = new AdminController();

router.get('/dashboard', adminController.getDashboardData.bind(adminController));
router.get('/products', adminController.getAllProducts.bind(adminController));
router.post('/products', adminController.createProduct.bind(adminController));
router.put('/products/:id', adminController.updateProduct.bind(adminController));
router.delete('/products/:id', adminController.deleteProduct.bind(adminController));

export default router; 