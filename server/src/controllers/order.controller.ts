import { NextFunction, Request, Response } from 'express';
import * as orderService from '@services/order.service';
import * as cartService from '@services/cart.service';

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
    const orders = await orderService.findOrdersByCustomer(req.user._id);
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
    const { address } = req.body;

    const { order, sessionUrl } = await orderService.create(req.user._id, req.user.cart, address);

    // Clear the cart
    await cartService.clearUserCart(req.user._id);

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
