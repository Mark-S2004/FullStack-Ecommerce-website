import { NextFunction, Request, Response } from 'express';
import * as cartService from '@services/cart.service';

export const getCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cart = await cartService.getCart(req.user._id);
    res.status(200).json({ data: cart, message: 'retrieved' });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity } = req.body;
    const updatedCart = await cartService.addToCart(req.user._id, productId, quantity);
    res.status(201).json({ data: updatedCart, message: 'added' });
  } catch (error) {
    next(error);
  }
};

export const updateCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity } = req.body;
    const updatedCart = await cartService.updateCart(req.user._id, productId, quantity);
    res.status(200).json({ data: updatedCart, message: 'updated' });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const updatedCart = await cartService.removeFromCart(req.user._id, productId);
    res.status(200).json({ data: updatedCart, message: 'removed' });
  } catch (error) {
    next(error);
  }
};
