import { HttpException } from '@exceptions/HttpException';
import userModel from '@models/users.model';
import productModel from '@models/products.model';

export const getCart = async (userId: string) => {
  const user = await userModel.findById(userId);
  if (!user) throw new HttpException(404, 'User not found');
  return user.cart;
};

export const addToCart = async (userId: string, productId: string, qty: number) => {
  const user = await userModel.findById(userId);
  if (!user) throw new HttpException(404, 'User not found');

  const product = await productModel.findById(productId);
  if (!product) throw new HttpException(404, 'Product not found');

  const existingItem = user.cart.find(item => item.product === productId);
  if (existingItem) {
    existingItem.qty += qty;
  } else {
    user.cart.push({ product: productId, qty, price: product.price });
  }

  await user.save();
  return user.cart;
};

export const updateCart = async (userId: string, productId: string, qty: number) => {
  const user = await userModel.findById(userId);
  if (!user) throw new HttpException(404, 'User not found');

  const product = await productModel.findById(productId);
  if (!product) throw new HttpException(404, 'Product not found');

  const item = user.cart.find(item => item.product === productId);
  if (!item) throw new HttpException(404, 'Product not in cart');

  item.qty = qty;
  await user.save();
  return user.cart;
};

export const removeFromCart = async (userId: string, productId: string) => {
  const user = await userModel.findById(userId);
  if (!user) throw new HttpException(404, 'User not found');

  user.cart = user.cart.filter(item => item.product != productId);
  await user.save();
  return user.cart;
};
