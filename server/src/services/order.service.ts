import OrderModel from '../models/order.model';
import stripe, { createMockCheckoutSession } from '../utils/stripe';
import { calcShipping, calcTax } from '../utils/orderCalculations';

export class OrderService {
  static async create(userId: string, cart: any[], address: any) {
    const items = cart.map(i => ({ product: i.id, qty: i.qty, price: i.price }));
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const shippingCost = calcShipping(address.country, items);
    const tax = calcTax(subtotal);
    const total = subtotal + shippingCost + tax;

    const order = await OrderModel.create({
      user: userId,
      items,
      shippingAddress: address,
      shippingCost,
      tax,
      total,
      status: 'Pending',
    });

    // Create Stripe Checkout session or use mock if stripe is not initialized
    const session = stripe ? await stripe.checkout.sessions.create({
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
    }) : createMockCheckoutSession();

    return { order, sessionUrl: session.url };
  }

  static async findUserOrders(userId: string) {
    return OrderModel.find({ user: userId }).sort({ createdAt: -1 });
  }

  static async findById(orderId: string) {
    return OrderModel.findById(orderId);
  }

  static async updateOrderStatus(orderId: string, status: string) {
    return OrderModel.findByIdAndUpdate(orderId, { status }, { new: true });
  }
}
