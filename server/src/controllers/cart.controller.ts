import { NextFunction, Request, Response } from 'express';
import * as cartService from '../services/cart.service';
import { CreateCartItemDto } from '../dtos/cart.dto';

// Get the user's cart
export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await cartService.getCart(req.user._id);
    res.status(200).json({ data: cart, message: 'found' });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity } = req.body;
    // Ensure productId is a string
    const productIdString = String(productId);
    const updatedCart = await cartService.addToCart(req.user._id, productIdString, quantity);
    res.status(201).json({ data: updatedCart, message: 'added' });
  } catch (error) {
    next(error);
  }
};

export const updateCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity } = req.body;
    // Ensure productId is a string
    const productIdString = String(productId);
    const updatedCart = await cartService.updateCart(req.user._id, productIdString, quantity);
    res.status(200).json({ data: updatedCart, message: 'updated' });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    // Ensure productId is a string
    const productIdString = String(productId);
    const updatedCart = await cartService.removeFromCart(req.user._id, productIdString);
    res.status(200).json({ data: updatedCart, message: 'removed' });
  } catch (error) {
    next(error);
  }
};
