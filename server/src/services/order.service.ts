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
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  
  // Use the updated calculation methods
  const shippingCost = calcShipping(address); // Pass the full address string
  const tax = calcTax(subtotal); // 14% VAT on subtotal
  const total = subtotal + shippingCost + tax; // Final total for the order

  const products = await Promise.all(
    cart.map(async item => {
      const product = await productModel.findById(item.product);
      if (!product) throw new HttpException(404, `Product not found: ${item.product}`);
      if (product.stock < item.qty) throw new HttpException(400, `Not enough stock for ${product.name} product`);
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

  // Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: products.map(({ product, item }) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name,
        },
        unit_amount: Math.round(item.price * 100), // Use item.price from cart, which is product's base price
      },
      quantity: item.qty,
    })),
    // Add shipping and tax as separate line items for better transparency
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: 'Shipping fee',
          type: 'fixed_amount',
          fixed_amount: {
            amount: Math.round(shippingCost * 100),
            currency: 'usd',
          },
        },
      },
    ],
    // Add tax details
    tax_rates: [
      {
        display_name: 'VAT (14%)',
        inclusive: false,
        percentage: 14,
      },
    ],
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

  return { order, sessionUrl: session.url };
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const order = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
  if (!order) throw new HttpException(404, 'Order not found');
  return order;
};
