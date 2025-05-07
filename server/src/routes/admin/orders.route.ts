import { Router } from 'express';
    // Import your admin orders controller functions
    import * as orderController from '@controllers/order.controller'; // Re-use existing order controller for list

    const router = Router();
    const path = '/admin/orders';

    router.get(`${path}`, orderController.getOrders); // Re-use getOrders, add admin auth middleware separately

    // Add routes for update status if implemented
    // router.put(`${path}/:id/status`, orderController.updateOrderStatus);


    export default { path, router };