import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';

export async function createOrder(req: Request, res: Response) {
  try {
    const { cart, address } = req.body;

    const userId = req.user._id; // Use authenticated user's ID

    const { order, sessionUrl } = await OrderService.create(userId, cart, address);
    res.status(201).json({ orderId: order._id, sessionUrl });
  } catch (error) {
    console.error('Create Order Error:', error); // 👈 log it
    res.status(500).json({ message: 'Error creating order', error });
  }
}

export async function getUserOrders(req: Request, res: Response) {
  try {
    const userId = req.user._id; // Use authenticated user's ID

    const orders = await OrderService.findUserOrders(userId);

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
}

export async function getOrderById(req: Request, res: Response) {
  try {
    const orderId = req.params.id;
    const order = await OrderService.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error });
  }
}
