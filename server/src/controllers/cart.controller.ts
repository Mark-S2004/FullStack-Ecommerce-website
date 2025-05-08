import { NextFunction, Response } from 'express';
import { RequestWithUser } from '@interfaces/auth.interface';
import * as cartService from '@services/cart.service';
import { HttpException } from '@exceptions/HttpException';

export const getCart = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const userWithCart = await cartService.getCart(req.user._id);
    res.status(200).json({ data: userWithCart, message: 'retrieved' });
  } catch (error) {
    next(error);
  }
};

export const addOrUpdateItemInCart = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || quantity === undefined) {
      throw new HttpException(400, 'ProductId and quantity are required');
    }
    if (typeof quantity !== 'number' || quantity < 0) {
        throw new HttpException(400, 'Quantity must be a non-negative number');
    }
    if (quantity === 0) {
        const userWithCart = await cartService.removeProductFromCart(req.user._id, productId);
        return res.status(200).json({ data: userWithCart, message: 'Item removed due to quantity 0' });
    }

    const userWithCart = await cartService.addOrUpdateProductInCart(req.user._id, productId, quantity);
    res.status(200).json({ data: userWithCart, message: quantity > 0 ? 'Cart updated' : 'Item quantity set to 0' });
  } catch (error) {
    next(error);
  }
};

export const removeItemFromCart = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const userWithCart = await cartService.removeProductFromCart(req.user._id, productId);
    res.status(200).json({ data: userWithCart, message: 'Item removed' });
  } catch (error) {
    next(error);
  }
};

export const clearCartHandler = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    await cartService.clearUserCart(req.user._id);
    const userWithEmptyCart = await cartService.getCart(req.user._id);
    res.status(200).json({ message: 'Cart cleared successfully', data: userWithEmptyCart });
  } catch (error) {
    next(error);
  }
};

export const applyDiscountHandler = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user._id;
    const { discountCode } = req.body;
    if (!discountCode) {
      throw new HttpException(400, 'Discount code is required');
    }
    const updatedUser = await cartService.applyDiscountToCart(userId, discountCode);
    res.status(200).json({
      message: 'Discount applied',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const removeDiscountHandler = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user._id;
    const updatedUser = await cartService.removeDiscountFromCart(userId);
    res.status(200).json({
      message: 'Discount removed',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};
