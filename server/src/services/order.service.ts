// src/services/order.service.ts

import { HttpException } from '@exceptions/HttpException';
import orderModel from '@models/order.model';
import stripe from '../utils/stripe';
import { calcShipping, calcTax } from '../utils/orderCalculations';
import { User } from '@interfaces/users.interface'; // Assuming User interface is correct now
import productModel from '@/models/products.model';
// Correct imports for Order, OrderItem, ShippingAddress interfaces
import { Order, OrderItem, ShippingAddress, OrderDocument } from '@interfaces/orders.interface'; // Import Order, OrderItem, ShippingAddress, OrderDocument
// Import Product interface
import { Product, ProductDocument } from '@interfaces/products.interface'; // Import Product and ProductDocument
// Import Types from mongoose as values
import { Types, Document } from 'mongoose'; // Import Types and Document


// Define the structure of cart items *after* population (as returned by cartService.getCart)
// This interface matches the structure returned by `getCart` in cart.service.ts
export interface PopulatedCartItemForOrderCreation { // Export this interface if needed elsewhere
    _id: Types.ObjectId; // Subdocument ID (as ObjectId)
    product: Product & Document; // Product is populated (as Product Document)
    quantity: number; // Use quantity
    price: number; // Price at time of add (can use product.price if recalculating)
    size?: string;
}


export const findAllOrders = async (): Promise<Order[]> => {
  // Populate user name and product names for easier display
  // Cast the result to the expected Order[] type which has populated fields
  return await orderModel.find()
    .populate('user', 'name')
    .populate('items.product', 'name price images') as unknown as Order[]; // Cast required due to deep population typing complexity
};

export const findOrdersByCustomer = async (customerId: string): Promise<Order[]> => {
   // Validate customerId format
    if (!Types.ObjectId.isValid(customerId)) {
       throw new HttpException(400, 'Invalid customer ID format');
    }
  // Populate product names within order items
  // Cast the result to the expected Order[] type which has populated fields
  return await orderModel.find({ user: customerId })
    .populate('items.product', 'name price') as unknown as Order[]; // Cast required
};

// Updated function signature and logic
// Expects userCart as the populated structure from cartService.getCart
export const create = async (userId: string, userCart: PopulatedCartItemForOrderCreation[], shippingAddress: ShippingAddress): Promise<{ order: Order; sessionUrl: string | null }> => { // Added return type
  if (!userCart || userCart.length === 0) {
    throw new HttpException(400, 'Cannot create order from empty cart');
  }

   if (!Types.ObjectId.isValid(userId)) {
       throw new HttpException(400, 'Invalid user ID format');
    }

  // Recalculate totals on the server side based on current product prices/stock
  // Fetch fresh product data to ensure price/stock is accurate and decrement stock
  const orderItemsForDB: OrderItem[] = await Promise.all(
    userCart.map(async (item) => {
       // Find the product document using the populated product's _id
      const product: (Product & Document) | null = await productModel.findById(item.product._id); // item.product._id should be the Product ObjectId string
      if (!product) {
           // Revert previous stock decrements if any failed *before* this one
           // For simplicity, throw and let the error handler manage cleanup or rely on retries
          throw new HttpException(404, `Product not found: ${item.product._id}`);
      }
      // Ensure stock is sufficient for the requested quantity
      if (product.stock < item.quantity) { // Use item.quantity
        // Revert stock decrement if this is a retry and stock was already decremented
        // For simplicity, just throw the error
         throw new HttpException(400, `Not enough stock for ${product.name}. Available: ${product.stock}. Requested: ${item.quantity}`); // Use item.quantity
      }
      // Decrement stock *before* creating order (or handle this post-payment confirmation)
      // Note: A more robust flow would reserve stock or decrement only on payment confirmation.
      // For simplicity based on the provided code, we'll decrement now.
       product.stock -= item.quantity; // Use item.quantity
       await product.save();

       // Return the item structure as required by the Order schema for storage
      return {
          product: new Types.ObjectId(product._id), // Store product as ObjectId
          quantity: item.quantity, // Store quantity
          price: product.price, // Store current price at time of order
          size: item.size,
      } as OrderItem; // Cast to OrderItem type
    })
  );

  // Recalculate totals using the current product prices from productDetails (which are fresh)
   const subtotal = orderItemsForDB.reduce((sum, item) => sum + item.price * item.quantity, 0); // Use item.price and item.quantity

  // Assuming country is part of the shippingAddress
  const country = shippingAddress.country || 'US'; // Default to US if not provided
  // Pass the items (or just total quantity/weight if calculations depend on that) to shipping calc
  // The `calcShipping` util needs to accept an array where items have a 'quantity' field.
  // Pass orderItemsForDB which has the 'quantity' field
  const shippingCost = calcShipping(country, orderItemsForDB);
  const tax = calcTax(subtotal);
  const total = subtotal + shippingCost + tax;

  // Create the order in your database
  const order: OrderDocument = await orderModel.create({ // Cast to OrderDocument
    user: new Types.ObjectId(userId), // Store user as ObjectId
    items: orderItemsForDB, // Use the items formatted for DB storage
    shippingAddress: shippingAddress, // Store the shipping address object
    shippingCost,
    tax,
    total,
    status: 'Pending', // Initial status before payment
    // Order number generated by the pre-save hook
  });

  // Create Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'], // Or 'cashapp', etc.
    mode: 'payment',
    line_items: orderItemsForDB.map(item => { // Use items formatted for DB
      // Find the corresponding populated product from the original userCart
       const populatedItem = userCart.find(cartItem => cartItem.product._id.toString() === item.product.toString()); // Find original populated product by ID string
       const productName = populatedItem?.product.name || 'Unknown Product';
       const productImages = populatedItem?.product.images && populatedItem.product.images.length > 0 ? [populatedItem.product.images[0]] : [];

      return {
        price_data: {
          currency: 'usd', // Ensure currency is correct
          product_data: {
             name: productName,
             images: productImages, // Use first image if available
          },
          unit_amount: Math.round(item.price * 100), // Price in cents from order item (price at time of order)
        },
        quantity: item.quantity, // Use item.quantity
       // Optional: add tax_behavior here if needed for line items
      };
    }),
     // Include shipping cost as a line item (optional, but common)
     shipping_options: [{
        // Use shipping_rate_data instead of shipping_amount
        shipping_rate_data: {
           type: 'fixed_amount',
           fixed_amount: {
             amount: Math.round(shippingCost * 100), // Shipping in cents
             currency: 'usd', // Ensure currency matches
           },
           display_name: 'Standard Shipping',
            // Optional: add tax_behavior here
        },
     }],
     // You can configure tax_behavior at the session level or line item level
     // For a simple flat tax already included in the total, you might set this to 'inclusive' or 'none'
     // depending on your Stripe tax settings and how the tax was calculated.
     // If tax is applied by Stripe based on destination, you'd configure tax_rates or default_tax_behavior.
     // tax_id: 'txr_...', // Reference a tax rate configured in Stripe
     // automatic_tax: { enabled: true }, // Let Stripe calculate tax

    success_url: `${process.env.CLIENT_URL}/checkout-success?orderId=${order._id.toString()}`, // Pass order _id string
    cancel_url: `${process.env.CLIENT_URL}/checkout-cancel`,
    metadata: {
      orderId: order._id.toString(), // Store the order ID for webhook
      userId: userId.toString(), // Also store user ID
    },
     // Allow promo codes if you have them set up in Stripe
     allow_promotion_codes: true,
  });

   // Important: Clearing the user's cart and decrementing stock is handled *before* creating the Stripe session
   // in this revised logic. A more robust system might do this post-payment confirmation via webhook.
   // The stock decrement is now inside the map function.

  // Return the plain order object (not the Mongoose document)
  return { order: order.toObject({ getters: true }), sessionUrl: session.url };
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => { // Use Order['status'] for type safety
  // Validate orderId format
   if (!Types.ObjectId.isValid(orderId)) {
       throw new HttpException(400, 'Invalid order ID format');
    }
  // Validate status
  const validStatuses: Order['status'][] = ['Pending', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
      throw new HttpException(400, `Invalid order status: ${status}`);
  }

  // Find and update by ID, result will be a Mongoose document. Populate for return value.
  const order = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true, runValidators: true })
    .populate('user', 'name')
    .populate('items.product', 'name price images') as (Order & Document) | null; // Cast the result


  if (!order) throw new HttpException(404, 'Order not found');

  // Return the plain order object
  return order.toObject({ getters: true });
};

// Replaced with a proper implementation to find a single order
export const findOrderById = async (orderId: string): Promise<Order> => {
    // Implementation to find a single order by ID
     if (!Types.ObjectId.isValid(orderId)) {
       throw new HttpException(400, 'Invalid order ID format');
    }
    // Find by ID, result will be a Mongoose document. Populate for return value.
    const order = await orderModel.findById(orderId)
      .populate('user', 'name')
      .populate('items.product', 'name price images') as (Order & Document) | null; // Cast the result

    if (!order) throw new HttpException(404, 'Order not found');

    // Return the plain order object
    return order.toObject({ getters: true });
};

// Added clearCart controller function to expose the service
// This function seems to be in the controller, not the service. Moving it back to the controller.
// You already have clearUserCart in cart.service.ts