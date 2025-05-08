import { HttpException } from '@exceptions/HttpException';
import userModel from '@models/users.model';
import productModel from '@models/products.model';
import { calcShipping, calcTax } from '../utils/orderCalculations'; // Import calculations
// Correct import for User interface
import { User } from '@interfaces/users.interface';
// Correct imports for OrderItem and Product interfaces from interfaces
import { OrderItem, Product } from '@interfaces/orders.interface'; // Import OrderItem, Product
import { Types, Document, DocumentArray } from 'mongoose'; // Import Types, Document, and DocumentArray

// Extend the User interface to provide better type hints for the cart field
// This helps TypeScript understand that user.cart is a Mongoose DocumentArray with item _id and populated product
interface UserWithPopulatedCart extends User {
    cart: DocumentArray<OrderItem & Document & { product: Product & Document }> ;
}


interface CartTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

// Updated to return items with populated product details and calculated totals
export const getCart = async (userId: string): Promise<{ items: OrderItem[], total: CartTotals }> => {
   if (!Types.ObjectId.isValid(userId)) {
       throw new HttpException(400, 'Invalid user ID format');
    }
  // Populate cart items with full product details
  const user = await userModel.findById(userId).populate('cart.product') as UserWithPopulatedCart | null; // Cast to the extended interface
  if (!user) throw new HttpException(404, 'User not found');

  // Use the mapped plain object structure for the response
  const mappedCartItems: OrderItem[] = user.cart.map(item => {
    // The populated product will be an object, check if it's populated
    const populatedProduct = item.product as Product & Document; // Cast to Product & Document

    // Ensure product is actually populated and has required fields
    if (!populatedProduct || !populatedProduct._id || !populatedProduct.name || populatedProduct.price === undefined) {
         console.error(`Failed to populate product for item ID ${item._id || 'unknown'}:`, item);
         // Optionally skip this item or throw an error
         // For now, returning a basic structure or skipping might be options
         return { // Return a minimal structure if product is missing/invalid
             _id: item._id ? item._id.toString() : 'unknown',
             product: { _id: 'unknown', name: 'Unknown Product', price: 0, images: [] },
             quantity: item.qty || 0, // Use qty from backend
             size: item.size
         };
    }


    return {
      _id: item._id ? item._id.toString() : 'unknown', // Convert subdocument ObjectId to string (handle potential missing ID)
      product: { // Include necessary product details
          _id: populatedProduct._id.toString(), // Convert product ObjectId to string
          name: populatedProduct.name,
          price: populatedProduct.price,
          images: populatedProduct.images
      },
      quantity: item.qty, // Use qty from backend
      size: item.size
    };
  });


  const subtotal = mappedCartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0); // Use item.quantity here
  // Assuming country is hardcoded or fetched from user profile/env
  const country = 'US'; // Replace with actual logic to get user's country
  // Pass the mapped plain objects to shipping calc if it needs populated data
  const shipping = calcShipping(country, mappedCartItems as any[]); // Pass mapped items (adjusting types if needed by calcShipping)
  const tax = calcTax(subtotal);
  const total = subtotal + shipping + tax;

  return {
    items: mappedCartItems, // Return the mapped plain objects
    total: { subtotal, tax, shipping, total },
  };
};

export const addToCart = async (userId: string, productId: string, qty: number, size: string) => {
   if (!Types.ObjectId.isValid(userId)) {
       throw new HttpException(400, 'Invalid user ID format');
    }
    if (!Types.ObjectId.isValid(productId)) {
       throw new HttpException(400, 'Invalid product ID format');
    }
  const user = await userModel.findById(userId);
  if (!user) throw new HttpException(404, 'User not found');

  const product = await productModel.findById(productId);
  if (!product) throw new HttpException(404, 'Product not found');

   if (product.stock < qty) { // Check stock before adding
     throw new HttpException(400, `Not enough stock for ${product.name}. Available: ${product.stock}`);
   }

  // Find if an item with the same product ID *and* size exists
  const existingItem = (user.cart as Types.DocumentArray<any>).find(item => item.product.toString() === productId && item.size === size); // Use type assertion for find if needed

  if (existingItem) {
    existingItem.qty += qty;
  } else {
    // Ensure item structure matches schema
    user.cart.push({ product: new Types.ObjectId(productId), qty, price: product.price, size }); // Store price at time of add
  }

  await user.save();
  // Fetch and return the updated cart with totals and populated product details
  return getCart(userId);
};

// Updated updateCart to use itemId (Mongoose subdocument ID)
export const updateCart = async (userId: string, itemId: string, quantity: number) => {
   if (!Types.ObjectId.isValid(userId)) {
       throw new HttpException(400, 'Invalid user ID format');
    }
    // Mongoose subdocument IDs are often plain strings, but checking ObjectId format is safer if they are ObjectId-like strings
     // if (!Types.ObjectId.isValid(itemId)) {
     //    throw new HttpException(400, 'Invalid cart item ID format');
     // }

  const user = await userModel.findById(userId);
  if (!user) throw new HttpException(404, 'User not found');

  // Find the specific item by its _id within the cart array
  // Use Mongoose's .id() method for subdocument IDs. This requires the cart property to be a Mongoose DocumentArray.
  // user.cart should be typed as Types.DocumentArray<OrderItem & Document> on the User model interface for this to be fully type-safe.
   const item = (user.cart as Types.DocumentArray<any>).id(itemId); // Use type assertion for .id()


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

// Updated removeItem to use itemId (Mongoose subdocument ID)
export const removeFromCart = async (userId: string, itemId: string) => {
   if (!Types.ObjectId.isValid(userId)) {
       throw new HttpException(400, 'Invalid user ID format');
    }
    // Mongoose subdocument IDs are often plain strings, but checking ObjectId format is safer if they are ObjectId-like strings
     // if (!Types.ObjectId.isValid(itemId)) {
     //    throw new HttpException(400, 'Invalid cart item ID format');
     // }
  const user = await userModel.findById(userId);
  if (!user) throw new HttpException(404, 'User not found');

  // Find the specific item by its _id within the cart array
  const item = (user.cart as Types.DocumentArray<any>).id(itemId); // Use type assertion for .id()


  if (!item) throw new HttpException(404, 'Item not in cart');

  // Remove the item using Mongoose's .remove() method on the subdocument
  item.remove();

  await user.save();
  // Fetch and return the updated cart with totals and populated product details
  return getCart(userId);
};

export const clearUserCart = async (userId: string) => {
   if (!Types.ObjectId.isValid(userId)) {
       throw new HttpException(400, 'Invalid user ID format');
    }
  // Find the user and set cart to an empty array
  const user = await userModel.findByIdAndUpdate(userId, { cart: [] }, { new: true });
  if (!user) throw new HttpException(404, 'User not found');

  // Return the cleared cart state
   return {
     items: [],
     total: { subtotal: 0, tax: 0, shipping: 0, total: 0 },
   };
};