import { HttpException } from '@exceptions/HttpException';
import orderModel from '@models/order.model';
import stripe from '../utils/stripe';
import { calcShipping, calcTax } from '../utils/orderCalculations';

export const findAllOrders = async () => {
  return await orderModel.find();
};

export const findOrdersByCustomer = async (customerId: string) => {
  return await orderModel.find({ customerId });
};

export const createOrder = async orderData => {
  return await orderModel.create(orderData);
};

export const create = async (userId: string, cart: any[], address: any) => {
  const items = cart.map(i => ({ product: i.id, qty: i.qty, price: i.price }));
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shippingCost = calcShipping(address.country, items);
  const tax = calcTax(subtotal);
  const total = subtotal + shippingCost + tax;

  const order = await orderModel.create({
    user: userId,
    items,
    shippingAddress: address,
    shippingCost,
    tax,
    total,
    status: 'Pending',
  });

  // Create Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: cart.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name || 'Product',
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    })),
    success_url: `${process.env.CLIENT_URL}/checkout-success?orderId=${order._id}`,
    cancel_url: `${process.env.CLIENT_URL}/checkout-cancel`,
    metadata: {
      orderId: order._id.toString(),
    },
  });

  return { order, sessionUrl: session.url };
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const order = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
  if (!order) throw new HttpException(404, 'Order not found');
  return order;
};
