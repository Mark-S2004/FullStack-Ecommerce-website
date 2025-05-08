import { Router } from 'express';
import * as orderController from '@controllers/order.controller';
import { CreateOrderDto } from '@dtos/orders.dto';
import validationMiddleware from '@middlewares/validation.middleware';

const path = '/orders'; // Base path for order routes
const router = Router(); // Create the router

// Define routes relative to the base path ('/orders')
// These will hit authRequiredMiddleware in app.ts if needsAuth is true for this route
router.get('/', orderController.getOrders); // Full path: /api/orders (likely admin)
router.get('/customer', orderController.getOrdersByCustomer); // Full path: /api/orders/customer (customer)
router.post('/', validationMiddleware(CreateOrderDto, 'body'), orderController.createOrder); // Full path: /api/orders (customer)
router.put('/:id/status', orderController.updateOrderStatus); // Full path: /api/orders/:id/status (likely admin)

export default { path, router };