import { NextFunction, Request, Response } from 'express';
import * as cartService from '@services/cart.service';
// Import the RequestWithUser interface
import { RequestWithUser } from '@interfaces/auth.interface'; // Assuming RequestWithUser is available


// Update functions to use RequestWithUser if they require user authentication
export const getCart = async (req: RequestWithUser, res: Response, next: NextFunction) => { // Use RequestWithUser
  try {
    const cart = await cartService.getCart(req.user._id.toString()); // Pass user ID string
    res.status(200).json({ data: cart, message: 'retrieved' });
  } catch (error) {
    next(error);
  }
};

// Update addToCart signature to accept size
export const addToCart = async (req: RequestWithUser, res: Response, next: NextFunction) => { // Use RequestWithUser
  try {
    // Access productId, quantity, and size from the body
    const { productId, quantity, size } = req.body;
    // Pass user ID, productId, quantity, and size to the service
    const updatedCart = await cartService.addToCart(req.user._id.toString(), productId, quantity, size); // Pass user ID string, quantity, size
    // The service returns the full updated cart, which matches the expected response structure
    res.status(201).json({ data: updatedCart, message: 'added' });
  } catch (error) {
    next(error);
  }
};

// Updated updateCart to use itemId from params and quantity from body
export const updateCart = async (req: RequestWithUser, res: Response, next: NextFunction) => { // Use RequestWithUser
  try {
    // Access itemId from params and quantity from body
    const { itemId } = req.params;
    const { quantity } = req.body;
    // Pass user ID, itemId, and quantity to the service
    const updatedCart = await cartService.updateCart(req.user._id.toString(), itemId, quantity); // Pass user ID string, itemId, quantity
     // The service returns the full updated cart, which matches the expected response structure
    res.status(200).json({ data: updatedCart, message: 'updated' });
  } catch (error) {
    next(error);
  }
};

// Updated removeFromCart to use itemId from params
export const removeFromCart = async (req: RequestWithUser, res: Response, next: NextFunction) => { // Use RequestWithUser
  try {
    // Access itemId from params
    const { itemId } = req.params;
    // Pass user ID and itemId to the service
    const updatedCart = await cartService.removeFromCart(req.user._id.toString(), itemId); // Pass user ID string, itemId
     // The service returns the full updated cart, which matches the expected response structure
    res.status(200).json({ data: updatedCart, message: 'removed' });
  } catch (error) {
    next(error);
  }
};

// Added clearCart controller function
export const clearCart = async (req: RequestWithUser, res: Response, next: NextFunction) => { // Use RequestWithUser
  try {
    // Pass user ID to the service
    const clearedCart = await cartService.clearUserCart(req.user._id.toString()); // Pass user ID string
     // The service returns the cleared cart structure, which matches the expected response structure
    res.status(200).json({ data: clearedCart, message: 'cleared' });
  } catch (error) {
    next(error);
  }
};