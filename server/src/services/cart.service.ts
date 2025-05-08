import { HttpException } from '../exceptions/HttpException';
import userModel from '../models/users.model';
import productModel from '../models/products.model';
import { User, CartItem } from '../interfaces/users.interface';
import { Product } from '../interfaces/products.interface';
import { Document, Types } from 'mongoose';
import * as discountService from './/discount.service';
import { Discount, DiscountType } from '../interfaces/discounts.interface';

export const calculateCartSubtotal = (cartItems: CartItem[]): number => {
  if (!cartItems) return 0;
  return cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
};

const populateUserCart = async (userDoc: User & Document) => {
  return userDoc.populate({ path: 'cart.product', model: 'Product', select: 'name price description stock category' });
};

const clearDiscountOnCartChange = async (user: User & Document): Promise<void> => {
  if (user.appliedDiscountCode) {
    user.appliedDiscountCode = undefined;
    user.discountAmount = 0;
    user.cartSubtotal = calculateCartSubtotal(user.cart);
    user.cartTotalAfterDiscount = user.cartSubtotal;
  }
};

export const getCart = async (userId: string): Promise<User> => {
  const user = await userModel.findById(userId);
  if (!user) throw new HttpException(404, 'User not found');
  const populatedUser = await populateUserCart(user);
  if (!populatedUser.appliedDiscountCode) {
    populatedUser.cartSubtotal = calculateCartSubtotal(populatedUser.cart);
    populatedUser.cartTotalAfterDiscount = populatedUser.cartSubtotal;
  }
  return populatedUser;
};

export const addOrUpdateProductInCart = async (userId: string, productId: string, qty: number): Promise<User> => {
  const user = await userModel.findById(userId);
  if (!user) throw new HttpException(404, 'User not found');

  const product = await productModel.findById(productId);
  if (!product) throw new HttpException(404, 'Product not found');
  if (product.stock < qty) throw new HttpException(400, 'Insufficient stock');

  const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId);

  if (cartItemIndex > -1) {
    user.cart[cartItemIndex].qty = qty;
  } else {
    user.cart.push({ product: new Types.ObjectId(productId) as any, qty, price: product.price });
  }
  
  await clearDiscountOnCartChange(user);
  user.cartSubtotal = calculateCartSubtotal(user.cart);
  if(!user.appliedDiscountCode) {
    user.cartTotalAfterDiscount = user.cartSubtotal;
  }

  await user.save();
  return populateUserCart(user);
};

export const removeProductFromCart = async (userId: string, productId: string): Promise<User> => {
  const user = await userModel.findById(userId);
  if (!user) throw new HttpException(404, 'User not found');

  user.cart = user.cart.filter(item => item.product.toString() !== productId);
  
  await clearDiscountOnCartChange(user);
  user.cartSubtotal = calculateCartSubtotal(user.cart);
  if(!user.appliedDiscountCode) {
    user.cartTotalAfterDiscount = user.cartSubtotal;
  }

  await user.save();
  return populateUserCart(user);
};

export const applyDiscountToCart = async (userId: string, discountCode: string): Promise<User> => {
  const user = await userModel.findById(userId).populate({ path: 'cart.product', model: 'Product', select: 'name price stock category' });
  if (!user) throw new HttpException(404, 'User not found');
  if (!user.cart || user.cart.length === 0) throw new HttpException(400, 'Cart is empty');

  const discount: Discount = await discountService.findDiscountByCode(discountCode.toUpperCase());

  if (discount.validFrom && discount.validFrom > new Date()) throw new HttpException(400, 'Discount not yet active');
  if (discount.validTo && discount.validTo < new Date()) throw new HttpException(400, 'Discount has expired');
  if (discount.usageLimit !== undefined && discount.timesUsed >= discount.usageLimit) throw new HttpException(400, 'Discount usage limit reached');

  const currentSubtotal = calculateCartSubtotal(user.cart);
  if (discount.minPurchase && currentSubtotal < discount.minPurchase) {
    throw new HttpException(400, `Minimum purchase of ${(discount.minPurchase / 100).toFixed(2)} required for this discount`);
  }

  let applicableSubtotal = 0;
  if (discount.applicableProducts && discount.applicableProducts.length > 0) {
    user.cart.forEach(item => {
      const cartProduct = item.product as Product;
      if (cartProduct && discount.applicableProducts.some(pId => pId.toString() === cartProduct._id.toString())) {
        applicableSubtotal += item.price * item.qty;
      }
    });
  } else if (discount.applicableCategories && discount.applicableCategories.length > 0) {
    user.cart.forEach(item => {
      const cartProduct = item.product as Product;
      if (cartProduct && cartProduct.category && discount.applicableCategories.includes(cartProduct.category)) {
        applicableSubtotal += item.price * item.qty;
      }
    });
  } else {
    applicableSubtotal = currentSubtotal;
  }

  let calculatedDiscountAmount = 0;
  if (discount.discountType === DiscountType.PERCENTAGE) {
    calculatedDiscountAmount = Math.round(applicableSubtotal * (discount.value / 100));
  } else if (discount.discountType === DiscountType.FIXED_AMOUNT) {
    calculatedDiscountAmount = discount.value;
  }
  calculatedDiscountAmount = Math.min(calculatedDiscountAmount, applicableSubtotal);

  user.cartSubtotal = currentSubtotal;
  user.appliedDiscountCode = discount.code;
  user.discountAmount = calculatedDiscountAmount;
  user.cartTotalAfterDiscount = currentSubtotal - calculatedDiscountAmount;

  await user.save();
  return user;
};

export const removeDiscountFromCart = async (userId: string): Promise<User> => {
  const user = await userModel.findById(userId);
  if (!user) throw new HttpException(404, 'User not found');

  await clearDiscountOnCartChange(user);
  await user.save();
  return user;
};

export const clearUserCart = async (userId: string): Promise<{ message: string }> => {
  const user = await userModel.findById(userId);
  if (!user) throw new HttpException(404, 'User not found');
  user.cart = [];
  await clearDiscountOnCartChange(user);
  user.cartSubtotal = 0;
  user.cartTotalAfterDiscount = 0;
  await user.save();
  return { message: 'Cart cleared successfully' };
};
