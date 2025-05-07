import { NextFunction, Request, Response } from 'express';
import * as orderService from '@services/order.service';
import * as cartService from '@services/cart.service'; // Import cartService
import { CreateOrderDto } from '@dtos/orders.dto'; // Keep if address validation is needed separately, otherwise can use the shipping address DTO
import validationMiddleware from '@middlewares/validation.middleware';
import { ShippingAddress } from '@interfaces/orders.interface'; // Import ShippingAddress interface

// Update createOrder signature to match the new service function
export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const shippingAddress: ShippingAddress = req.body.shippingAddress; // Assuming shippingAddress is sent in the body

    // Fetch the user's cart first
     const { items: userCart } = await cartService.getCart(req.user._id); // Fetch cart with populated products

    if (!userCart || userCart.length === 0) {
        throw new HttpException(400, 'Cannot create order from empty cart');
    }

    // Pass the user's populated cart and shipping address to the service
    const { order, sessionUrl } = await orderService.create(req.user._id, userCart, shippingAddress);

    // Clear the user's cart only AFTER the order and Stripe session are successfully created
    await cartService.clearUserCart(req.user._id); // Clear the cart

    res.status(201).json({ orderId: order._id, sessionUrl, message: 'Order created and checkout session initiated' });
  } catch (error) {
    console.error('Create Order Error:', error); // Log the error
    next(error); // Pass error to the error middleware
  }
}

// Keep other order controller functions as is, they seem fine with the updated service
export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await orderService.findAllOrders();
    // Adjust response format if needed by frontend, e.g., wrap in { orders: [] }
    res.status(200).json({ orders: orders, message: 'findAll' });
  } catch (error) {
    next(error);
  }
};

export const getOrdersByCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await orderService.findOrdersByCustomer(req.user._id);
     // Adjust response format if needed by frontend
    res.status(200).json({ orders: orders, message: 'findByCustomer' });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    const status = req.body.status;
    const updatedOrder = await orderService.updateOrderStatus(orderId, status);
     // Adjust response format if needed by frontend
    res.status(200).json({ order: updatedOrder, message: 'updatedStatus' });
  } catch (error) {
    next(error);
  }
};