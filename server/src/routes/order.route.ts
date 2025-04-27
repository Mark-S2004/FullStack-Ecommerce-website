import { Router } from 'express';
import { createOrder } from '@controllers/order.controller'; // <-- your controller
import { Routes } from '@interfaces/routes.interface'; // <-- your interface

class OrderRoute implements Routes {
  public path = '/orders';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/checkout', createOrder);
  }
}

export default OrderRoute;
