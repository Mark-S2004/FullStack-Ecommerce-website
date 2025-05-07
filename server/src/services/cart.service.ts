import { HttpException } from '@exceptions/HttpException';
import userModel from '@models/users.model';
import productModel from '@models/products.model';
import { calcShipping, calcTax } from '../utils/orderCalculations'; // Import calculations
import { User, OrderItem } from '@interfaces/users.interface'; // Import User and OrderItem interfaces

interface CartTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

// Updated to return items with populated product details and calculated totals
export const getCart = async (userId: string): Promise<{ items: OrderItem[], total: CartTotals }> => {
  const user = await userModel.findById(userId).populate('cart.product'); // Populate product details
  if (!user) throw new HttpException(404, 'User not found');

  const populatedCartItems = user.cart as any as (OrderItem & { product: { price: number } })[]; // Type assertion for populated price

  const subtotal = populatedCartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  // Assuming country is hardcoded or fetched from user profile/env
  const country = 'US'; // Replace with actual logic to get user's country
  const shipping = calcShipping(country, populatedCartItems);
  const tax = calcTax(subtotal);
  const total = subtotal + shipping + tax;

  return {
    items: populatedCartItems,
    total: { subtotal, tax, shipping, total },
  };
};

export const addToCart = async (userId: string, productId: string, qty: number, size: string) => {
  const user = await userModel.findById(userId);
  if (!user) throw new HttpException(404, 'User not found');

  const product = await productModel.findById(productId);
  if (!product) throw new HttpException(404, 'Product not found');

   if (product.stock < qty) { // Check stock before adding
     throw new HttpException(400, `Not enough stock for ${product.name}`);
   }

  // Find if an item with the same product ID *and* size exists
  const existingItem = user.cart.find(item => item.product.toString() === productId && item.size === size);

  if (existingItem) {
    existingItem.qty += qty;
  } else {
    user.cart.push({ product: new Types.ObjectId(productId), qty, price: product.price, size }); // Store price at time of add
  }

  await user.save();
  // Fetch and return the updated cart with totals and populated product details
  return getCart(userId);
};

export const updateCart = async (userId: string, itemId: string, quantity: number) => {
  const user = await userModel.findById(userId);
  if (!user) throw new HttpException(404, 'User not found');

  // Find the specific item by its _id within the cart array
  const item = user.cart.id(itemId); // Use Mongoose's .id() method for subdocument IDs

  if (!item) throw new HttpException(404, 'Item not in cart');

  // Get the product details to check stock
  const product = await productModel.findById(item.product);
   if (!product) throw new HttpException(404, 'Product for item not found'); // Should not happen if item exists but good check

   if (product.stock < quantity) { // Check stock against requested total quantity
     throw new HttpException(400, `Not enough stock for ${product.name}. Available: ${product.stock}`);
   }

  item.qty = quantity;

  await user.save();
   // Fetch and return the updated cart with totals and populated product details
  return getCart(userId);
};

export const removeFromCart = async (userId: string, itemId: string) => {
  const user = await userModel.findById(userId);
  if (!user) throw new HttpException(404, 'User not found');

  // Find the specific item by its _id within the cart array
  const item = user.cart.id(itemId); // Use Mongoose's .id() method for subdocument IDs

  if (!item) throw new HttpException(404, 'Item not in cart');

  // Remove the item using Mongoose's .remove() method on the subdocument
  item.remove();

  await user.save();
  // Fetch and return the updated cart with totals and populated product details
  return getCart(userId);
};

export const clearUserCart = async (userId: string) => {
  // Find the user and set cart to an empty array
  const user = await userModel.findByIdAndUpdate(userId, { cart: [] }, { new: true });
  if (!user) throw new HttpException(404, 'User not found');

  // Return the cleared cart state
   return {
     items: [],
     total: { subtotal: 0, tax: 0, shipping: 0, total: 0 },
   };
};