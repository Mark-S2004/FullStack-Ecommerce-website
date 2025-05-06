import { NextFunction, Request, Response } from 'express';
import * as orderService from '@services/order.service';

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await orderService.findAllOrders();
    res.status(200).json({ data: orders, message: 'findAll' });
  } catch (error) {
    next(error);
  }
};

export const getOrdersByCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.params.customerId;
    const orders = await orderService.findOrdersByCustomer(customerId);
    res.status(200).json({ data: orders, message: 'findByCustomer' });
  } catch (error) {
    next(error);
  }
};

// export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const orderData = req.body;
//     const newOrder = await orderService.createOrder(orderData);
//     res.status(201).json({ data: newOrder, message: 'created' });
//   } catch (error) {
//     next(error);
//   }
// };
export async function createOrder(req: Request, res: Response) {
  try {
    const { cart, address } = req.body;

    const userId = '660eb1c8a0dc1f001b152db6'; // <-- hardcoded test User ID

    const { order, sessionUrl } = await orderService.create(userId, cart, address);
    res.status(201).json({ orderId: order._id, sessionUrl });
  } catch (error) {
    console.error('Create Order Error:', error); // 👈 log it
    res.status(500).json({ message: 'Error creating order', error });
  }
}

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    const status = req.body.status;
    const updatedOrder = await orderService.updateOrderStatus(orderId, status);
    res.status(200).json({ data: updatedOrder, message: 'updatedStatus' });
  } catch (error) {
    next(error);
  }
};
