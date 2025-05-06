import express from 'express';
import {
  createDiscount,
  getAllDiscounts,
  getDiscountDetails,
  updateDiscount,
  deleteDiscount,
  validateDiscount,
  applyDiscountToProducts,
} from '../controllers/discountController';
import { isAuthenticated, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/validate', validateDiscount);

// Admin routes
router.post('/new', isAuthenticated, authorizeRoles('admin'), createDiscount);
router.get('/', isAuthenticated, authorizeRoles('admin'), getAllDiscounts);
router.get('/:id', isAuthenticated, authorizeRoles('admin'), getDiscountDetails);
router.put('/:id', isAuthenticated, authorizeRoles('admin'), updateDiscount);
router.delete('/:id', isAuthenticated, authorizeRoles('admin'), deleteDiscount);
router.post('/apply-to-products', isAuthenticated, authorizeRoles('admin'), applyDiscountToProducts);

export default router; 