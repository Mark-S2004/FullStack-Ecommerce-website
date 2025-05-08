
import { NextFunction, Request, Response } from 'express';
import * as orderService from '@services/order.service';
import * as cartService from '@services/cart.service'; // Import cartService
// import { CreateOrderDto } from '@dtos/orders.dto'; // Keep if address validation is needed separately, otherwise can use the shipping address DTO
import { RequestWithUser } from '@interfaces/auth.interface'; // Import RequestWithUser
import { HttpException } from '@exceptions/HttpException'; // Import HttpException
// Assuming ShippingAddress DTO is used for validation
// import validationMiddleware from '@middlewares/validation.middleware';
// import { ShippingAddress } from '@interfaces/orders.interface'; // Import ShippingAddress interface

export const getOrders = async (req: RequestWithUser, res: Response, next: NextFunction) => { // Use RequestWithUser
  try {
    const orders = await orderService.findAllOrders();
    // Adjust response format if needed by frontend, e.g., wrap in { orders: [] }
    res.status(200).json({ data: { orders: orders }, message: 'findAll' }); // Wrapped in data object
  } catch (error) {
    next(error);
  }
};

export const getOrdersByCustomer = async (req: RequestWithUser, res: Response, next: NextFunction) => { // Use RequestWithUser
  try {
    const orders = await orderService.findOrdersByCustomer(req.user._id); // Access req.user._id
     // Adjust response format if needed by frontend
    res.status(200).json({ data: { orders: orders }, message: 'findByCustomer' }); // Wrapped in data object
  } catch (error) {
    next(error);
  }
};

// Update createOrder signature to match the new service function
export async function createOrder(req: RequestWithUser, res: Response, next: NextFunction) { // Use RequestWithUser
  try {
    // Assuming shippingAddress is sent in the body and validated by middleware
    const shippingAddress = req.body.shippingAddress; // Access shippingAddress object from body

    // Fetch the user's cart first (service will populate products)
     const { items: userCart } = await cartService.getCart(req.user._id); // Access req.user._id

    if (!userCart || userCart.length === 0) {
        throw new HttpException(400, 'Cannot create order from empty cart');
    }

    // Pass the user's populated cart and shipping address to the service
    const { order, sessionUrl } = await orderService.create(req.user._id, userCart, shippingAddress); // Pass req.user._id and shippingAddress

    // Clear the user's cart only AFTER the order and Stripe session are successfully created
    await cartService.clearUserCart(req.user._id); // Access req.user._id and clear the cart

    res.status(201).json({ orderId: order._id, sessionUrl, message: 'Order created and checkout session initiated' });
  } catch (error) {
    console.error('Create Order Error:', error); // Log the error
    next(error); // Pass error to the error middleware
  }
}

export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    const status = req.body.status;
    // Need to check if status is a valid enum value before passing to service
    const updatedOrder = await orderService.updateOrderStatus(orderId, status);
     // Adjust response format if needed by frontend
    res.status(200).json({ data: { order: updatedOrder }, message: 'updatedStatus' }); // Wrapped in data object
  } catch (error) {
    next(error);
  }
};