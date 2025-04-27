import { Request, Response } from 'express';
import { CartService } from '../services/cart.service';

export class CartController {
  static async getCart(req: Request, res: Response) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const cart = await CartService.getCart(req.user._id);
      res.json(cart || { items: [] });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch cart', details: error.message });
    }
  }

  static async updateCart(req: Request, res: Response) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const updatedCart = await CartService.updateCart(req.user._id, req.body.items);
      res.json(updatedCart);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update cart', details: error.message });
    }
  }

  static async clearCart(req: Request, res: Response) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      await CartService.clearCart(req.user._id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to clear cart', details: error.message });
    }
  }
}
