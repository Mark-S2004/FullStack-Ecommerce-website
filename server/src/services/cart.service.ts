// server/src/services/cart.service.ts
import { HttpException } from '@exceptions/HttpException';
import userModel from '@models/users.model';
import productModel from '@models/products.model';
import { calcShipping, calcTax } from '../utils/orderCalculations';
import { User } from '@interfaces/users.interface';
import { OrderItem } from '@interfaces/orders.interface';
import { Product, ProductDocument } from '../../../server/src/interfaces/products.interface';

import { Types, Document, CastError } from 'mongoose';


// Define the structure of cart items *after* population and serialization (as returned by this service)
interface ReturnedCartItem {
    _id: string;
    product: Product; // Populated Product object (plain)
    quantity: number;
    price: number; // Price stored in the cart item (price at time of add)
    size?: string;
}

export interface CartTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

export const getCart = async (userId: string): Promise<{ items: ReturnedCartItem[], total: CartTotals }> => {
   if (!Types.ObjectId.isValid(userId)) {
       throw new HttpException(400, 'Invalid user ID format');
    }
  const user = await userModel.findById(userId).populate('cart.product') as (User & Document & { cart: Types.DocumentArray<OrderItem & Document & { product: Product & Document }> }) | null;
  if (!user) throw new HttpException(404, 'User not found');

  const returnedCartItems: ReturnedCartItem[] = user.cart.map(item => {
    // Explicitly assert the type of item.product inside the map callback, casting through 'any'
    // This is a workaround for Mongoose/TS population typing challenges
    const populatedProduct = item.product as any as Product & Document;

    if (!populatedProduct || !populatedProduct._id || !populatedProduct.name || populatedProduct.price === undefined || populatedProduct.stock === undefined) {
         console.error(`Failed to populate product for item ID ${item._id?.toString() || 'unknown'}:`, item);
         return null;
    }

    return {
      _id: item._id.toString(),
      product: populatedProduct.toObject({ getters: true }), // Convert populated product Document to plain object
      quantity: item.quantity,
      price: item.price,
      size: item.size,
    } as ReturnedCartItem;
  }).filter((item): item is ReturnedCartItem => item !== null);


  const subtotal = returnedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const country = 'US';
  const shipping = calcShipping(country, returnedCartItems);
  const tax = calcTax(subtotal);
  const total = subtotal + shipping + tax;

  return {
    items: returnedCartItems,
    total: { subtotal, tax, shipping, total },
  };
};

export const addToCart = async (userId: string, productId: string, quantity: number, size: string) => {
   if (!Types.ObjectId.isValid(userId)) {
       throw new HttpException(400, 'Invalid user ID format');
    }
    if (!Types.ObjectId.isValid(productId)) {
       throw new HttpException(400, 'Invalid product ID format');
    }
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) {
       throw new HttpException(400, 'Invalid quantity provided');
    }

  const user = await userModel.findById(userId);
  if (!user) throw new HttpException(404, 'User not found');

  const product = await productModel.findById(productId);
  if (!product) throw new HttpException(404, 'Product not found');

   if (product.stock < quantity) {
     throw new HttpException(400, `Not enough stock for ${product.name}. Available: ${product.stock}. Requested: ${quantity}`);
   }

  const existingItem = (user.cart as Types.DocumentArray<OrderItem & Document>).find(item => item.product.toString() === productId && item.size === size);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    user.cart.push({ product: new Types.ObjectId(productId), quantity, price: product.price, size });
  }

  await user.save();
  return getCart(userId);
};

export const updateCart = async (userId: string, itemId: string, quantity: number) => {
   if (!Types.ObjectId.isValid(userId)) {
       throw new HttpException(400, 'Invalid user ID format');
    }
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) {
       throw new HttpException(400, 'Invalid quantity provided');
    }
     if (!Types.ObjectId.isValid(itemId)) {
        throw new HttpException(400, 'Invalid cart item ID format');
     }

  const user = await userModel.findById(userId);
  if (!user) throw new HttpException(404, 'User not found');

   const item = (user.cart as Types.DocumentArray<OrderItem & Document>).id(itemId);

  if (!item) throw new HttpException(404, 'Item not in cart');

  const product = await productModel.findById(item.product);
   if (!product) throw new HttpException(404, 'Product for item not found');

   if (product.stock < quantity) {
     throw new HttpException(400, `Not enough stock for ${product.name}. Available: ${product.stock}. Requested: ${quantity}`);
   }

  item.quantity = quantity;

  await user.save();
  return getCart(userId);
};

export const removeFromCart = async (userId: string, itemId: string) => {
   if (!Types.ObjectId.isValid(userId)) {
       throw new HttpException(400, 'Invalid user ID format');
    }
     if (!Types.ObjectId.isValid(itemId)) {
        throw new HttpException(400, 'Invalid cart item ID format');
     }
  const user = await userModel.findById(userId);
  if (!user) throw new HttpException(404, 'User not found');

  (user.cart as Types.DocumentArray<OrderItem & Document>).pull({ _id: new Types.ObjectId(itemId) });

  await user.save();
  return getCart(userId);
};

export const clearUserCart = async (userId: string) => {
   if (!Types.ObjectId.isValid(userId)) {
       throw new HttpException(400, 'Invalid user ID format');
    }
  const user = await userModel.findByIdAndUpdate(userId, { cart: [] }, { new: true });
  if (!user) throw new HttpException(404, 'User not found');

   return {
     items: [],
     total: { subtotal: 0, tax: 0, shipping: 0, total: 0 },
   };
};