import { Router } from 'express';
import * as orderController from '@controllers/order.controller';
import { CreateOrderDto } from '@dtos/orders.dto';
import validationMiddleware from '@middlewares/validation.middleware';

const path = '/orders';
const router = Router();

router.get(`${path}`, orderController.getOrders);
router.get(`${path}/customer/`, orderController.getOrdersByCustomer);
router.post(`${path}`, validationMiddleware(CreateOrderDto, 'body'), orderController.createOrder);
router.put(`${path}/:id/status`, orderController.updateOrderStatus);

export default { path, router };
