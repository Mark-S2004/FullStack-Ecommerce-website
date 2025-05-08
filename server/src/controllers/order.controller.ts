import { NextFunction, Request, Response } from 'express';
import * as orderService from '@services/order.service';
import * as cartService from '@services/cart.service'; // Import cartService
// Removed unused DTO import
// import { CreateOrderDto } from '@dtos/orders.dto'; // Keep if address validation is needed separately, otherwise can use the shipping address DTO
import { RequestWithUser } from '@interfaces/auth.interface'; // Import RequestWithUser
import { HttpException } from '@exceptions/HttpException'; // Import HttpException
// Assuming ShippingAddress DTO is used for validation
// import validationMiddleware from '@middlewares/validation.middleware';
// import { ShippingAddress } from '@interfaces/orders.interface'; // Import ShippingAddress interface
// Import PopulatedCartItem interface for type hinting
import { PopulatedCartItem } from '@services/cart.service'; // Import PopulatedCartItem


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
    const orders = await orderService.findOrdersByCustomer(req.user._id.toString()); // Access req.user._id and convert to string
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
    // Access the nested shippingAddress object
    const shippingAddress = req.body.shippingAddress; // Access shippingAddress object from body

     // Check if shippingAddress is provided and valid if it's mandatory
     if (!shippingAddress) {
         // This should ideally be caught by validationMiddleware, but double-check
         throw new HttpException(400, 'Shipping address is required');
     }


    // Fetch the user's cart first (service will populate products)
     // Fetch the cart as the populated structure expected by the order service `create` function
     const { items: userCart } = await cartService.getCart(req.user._id.toString()); // Access req.user._id and convert to string

    if (!userCart || userCart.length === 0) {
        throw new HttpException(400, 'Cannot create order from empty cart');
    }

    // Pass the user's populated cart and shipping address to the service
    const { order, sessionUrl } = await orderService.create(req.user._id.toString(), userCart as PopulatedCartItem[], shippingAddress); // Pass req.user._id string and shippingAddress, cast userCart

    // Clear the user's cart only AFTER the order and Stripe session are successfully created (service handles stock)
    // cartService.clearUserCart is now called by orderService.create after stock decrements
    // If clearUserCart is *also* called here, it will be redundant/incorrect.
    // The new orderService.create logic handles stock and returns Stripe session.
    // Let's assume the cart is cleared by the service.


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
    // The service function should ideally handle status validation
    const updatedOrder = await orderService.updateOrderStatus(orderId, status);
     // Adjust response format if needed by frontend
    res.status(200).json({ data: { order: updatedOrder }, message: 'updatedStatus' }); // Wrapped in data object
  } catch (error) {
    next(error);
  }
};

// Added clearCart controller function to expose the service
export const clearCart = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const clearedCart = await cartService.clearUserCart(req.user._id.toString());
        res.status(200).json({ data: clearedCart, message: 'cleared' });
    } catch (error) {
        next(error);
    }
}