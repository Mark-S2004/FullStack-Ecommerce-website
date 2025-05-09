import { HttpException } from '@exceptions/HttpException';
import orderModel from '@models/order.model';
import stripe from '../utils/stripe';
import { calcShipping, calcTax } from '../utils/orderCalculations';
import { OrderItem } from '@interfaces/orders.interface';
import productModel from '@/models/products.model';

export const findAllOrders = async () => {
  return await orderModel.find();
};

export const findOrdersByCustomer = async (customerId: string) => {
  return await orderModel.find({ user: customerId });
};

export const createOrder = async orderData => {
  return await orderModel.create(orderData);
};

export const create = async (userId: string, cart: OrderItem[], address: string) => {
  try {
    if (!cart || cart.length === 0) {
      throw new HttpException(400, 'Cart is empty');
    }
    
    if (!address) {
      throw new HttpException(400, 'Shipping address is required');
    }

    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    
    // Use the updated calculation methods
    const shippingCost = calcShipping(address); // Pass the full address string
    const tax = calcTax(subtotal); // 14% VAT on subtotal
    const total = subtotal + shippingCost + tax; // Final total for the order

    console.log('[Order Service] Processing order:', {
      userId,
      items: cart.length,
      address,
      subtotal,
      shippingCost,
      tax,
      total
    });

    const products = await Promise.all(
      cart.map(async item => {
        const product = await productModel.findById(item.product);
        if (!product) throw new HttpException(404, `Product not found: ${item.product}`);
        if (product.stock < item.qty) throw new HttpException(400, `Not enough stock for ${product.name} product`);
        
        // Update stock
        product.stock -= item.qty;
        await product.save();
        
        return { product, item };
      }),
    );

    const order = await orderModel.create({
      user: userId,
      items: cart, // Cart items with their original prices
      shippingAddress: address,
      shippingCost, // Calculated shipping cost
      tax,          // Calculated tax
      total,        // Grand total including subtotal, shipping, and tax
      status: 'Pending',
    });

    console.log('[Order Service] Created order:', order._id);

    // Create line items for Stripe
    const lineItems = [];
    
    // Add product items
    products.forEach(({ product, item }) => {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: `Quantity: ${item.qty}`
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.qty,
      });
    });
    
    // Add shipping as a line item
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Shipping',
          description: `Shipping to: ${address}`
        },
        unit_amount: Math.round(shippingCost * 100), // Convert to cents
      },
      quantity: 1,
    });
    
    // Add tax as a line item
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Tax (14% VAT)',
        },
        unit_amount: Math.round(tax * 100), // Convert to cents
      },
      quantity: 1,
    });

    console.log('[Order Service] Creating Stripe session with line items');

    // Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL || 'http://localhost:8000'}/checkout-success?orderId=${order._id}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:8000'}/checkout-cancel`,
      metadata: {
        orderId: order._id.toString(),
        total: total.toFixed(2),
        subtotal: subtotal.toFixed(2),
        shipping: shippingCost.toFixed(2),
        tax: tax.toFixed(2)
      },
    });

    console.log('[Order Service] Stripe session created:', session.id);
    return { order, sessionUrl: session.url };
  } catch (error) {
    console.error('[Order Service] Error creating order:', error);
    throw error; // Re-throw to be handled by controller
  }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const order = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
  if (!order) throw new HttpException(404, 'Order not found');
  return order;
};
