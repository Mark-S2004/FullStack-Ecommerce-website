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
  const shippingCost = calcShipping('US', cart);
  const tax = calcTax(subtotal);
  const total = subtotal + shippingCost + tax;

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
    items: cart,
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
    line_items: products.map(({ product, item }) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.name,
        },
        unit_amount: Math.round(product.price * 100),
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
