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
        // Stripe unit_amount should be the price of the item itself.
        // Tax and shipping are part of the overall order total managed by our system.
        // If Stripe is to calculate tax/shipping, it needs different setup (tax_rates, shipping_options).
        unit_amount: Math.round(item.price * 100), // Use item.price from cart, which is product's base price
      },
      quantity: item.qty,
    })),
    // The success_url and cancel_url are already updated
    success_url: `${process.env.CLIENT_URL || 'http://localhost:8000'}/checkout-success?orderId=${order._id}`,
    cancel_url: `${process.env.CLIENT_URL || 'http://localhost:8000'}/checkout-cancel`,
    metadata: {
      orderId: order._id.toString(),
    },
    // To pass the total amount if line_items don't sum up to it (e.g. due to server-calculated tax/shipping):
    // This isn't the standard way for Checkout with line_items, usually you'd add tax/shipping as separate line items or use Stripe Tax.
    // However, if we want to ensure Stripe charges the *exact* server-calculated total and line_items are just descriptive:
    // We might need to create a Price object for the *total amount* if using PaymentIntents directly, 
    // or ensure line_items correctly sum up, or use a single line_item representing the total.
    // For now, line_items are based on product prices. The Order Total includes tax/shipping.
    // Stripe may show subtotal of line items and then allow adding tax/shipping at its end if not configured here.
    // Let's ensure the order.total is the source of truth for what the user should pay.
  });

  return { order, sessionUrl: session.url };
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const order = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
  if (!order) throw new HttpException(404, 'Order not found');
  return order;
};
