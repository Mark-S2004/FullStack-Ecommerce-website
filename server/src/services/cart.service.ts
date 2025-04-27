import { CartModel } from '../models/cart.model';

export class CartService {
  static async getCart(userId: string) {
    return CartModel.findOne({ userId }).populate('items.product');
  }

  static async updateCart(userId: string, items: any[]) {
    return CartModel.findOneAndUpdate(
      { userId },
      { items },
      { upsert: true, new: true }
    ).populate('items.product');
  }

  static async clearCart(userId: string) {
    return CartModel.findOneAndDelete({ userId });
  }
}
