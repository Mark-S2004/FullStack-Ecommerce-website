import express from 'express';
import { 
  createOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
  calculateShippingAndTax
} from '../controllers/orderController';
import { isAuthenticated, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// Calculate shipping and tax
router.post('/calculate', calculateShippingAndTax);

// Create new order
router.post('/new', isAuthenticated, createOrder);

// Get logged in user orders
router.get('/me', isAuthenticated, myOrders);

// Get single order
router.get('/:id', isAuthenticated, getSingleOrder);

// Admin routes
router.get('/admin/orders', isAuthenticated, authorizeRoles('admin'), getAllOrders);
router.put('/admin/order/:id', isAuthenticated, authorizeRoles('admin'), updateOrder);
router.delete('/admin/order/:id', isAuthenticated, authorizeRoles('admin'), deleteOrder);

export default router; 