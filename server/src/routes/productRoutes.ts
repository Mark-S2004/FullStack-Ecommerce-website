import express from 'express';
import {
  getAllProducts,
  getProductDetails,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteReview,
  moderateReview,
  getProductsWithReviews
} from '../controllers/productController';
import { isAuthenticated, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductDetails);

// Review routes
router.put('/review', isAuthenticated, createProductReview);
router.get('/reviews', getProductReviews);
router.delete('/reviews', isAuthenticated, deleteReview);

// Review moderation -- Admin
router.put('/admin/review/moderate', isAuthenticated, authorizeRoles('admin'), moderateReview);
router.get('/admin/reviews', isAuthenticated, authorizeRoles('admin'), getProductsWithReviews);

// Admin routes
router.post('/admin/product/new', isAuthenticated, authorizeRoles('admin'), createProduct);
router.put('/admin/product/:id', isAuthenticated, authorizeRoles('admin'), updateProduct);
router.delete('/admin/product/:id', isAuthenticated, authorizeRoles('admin'), deleteProduct);

export default router; 