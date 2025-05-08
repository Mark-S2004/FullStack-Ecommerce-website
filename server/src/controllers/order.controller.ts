import { NextFunction, Request, Response } from 'express';
import * as orderService from '@services/order.service';
import * as cartService from '@services/cart.service';
import { RequestWithUser } from '@interfaces/auth.interface';
import { HttpException } from '@exceptions/HttpException';
import { OrderStatus } from '@interfaces/orders.interface';

export const getOrders = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const orders = await orderService.findOrdersByCustomer(req.user._id);
    res.status(200).json({ data: orders, message: 'findAll' });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const orders = await orderService.findOrdersByCustomer(req.user._id);
    res.status(200).json({ data: orders, message: 'findByCustomer' });
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user._id;
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
      throw new HttpException(400, 'Shipping address is required');
    }

    const result = await orderService.createOrderFromCart(userId, shippingAddress);
    
    res.status(201).json({ 
      message: 'Order created and Stripe session initiated', 
      orderId: result.order._id,
      sessionUrl: result.sessionUrl 
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const updatedOrder = await orderService.updateOrderStatusAndPayment(orderId, status as OrderStatus);
    res.status(200).json({ data: updatedOrder, message: 'updated' });
  } catch (error) {
    next(error);
  }
};
