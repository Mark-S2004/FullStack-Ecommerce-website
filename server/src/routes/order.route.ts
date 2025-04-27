import { Router } from 'express';
import * as orderController from '@controllers/order.controller';

const path = '/orders';
const router = Router();

router.post('/checkout', orderController.createOrder);

export default { path, router };
