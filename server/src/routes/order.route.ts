import { Router } from 'express';
import * as orderController from '@controllers/order.controller';
import { CreateOrderDto } from '@dtos/orders.dto';
import validationMiddleware from '@middlewares/validation.middleware';

const path = '/orders';
const router = Router();

router.get(`${path}`, orderController.getOrders);
router.get(`${path}/customer/:customerId`, orderController.getOrdersByCustomer);
router.post(`${path}`, validationMiddleware(CreateOrderDto, 'body'), orderController.createOrder);
router.put(`${path}/:id/status`, orderController.updateOrderStatus);
router.post('/checkout', orderController.createOrder);

export default { path, router };
