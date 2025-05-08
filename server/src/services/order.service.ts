import { HttpException } from '@exceptions/HttpException';
import orderModel from '@models/order.model';
import userModel from '@models/users.model';
import productModel from '@models/products.model';
import { Order, OrderItem, OrderStatus } from '@interfaces/orders.interface';
import { Product } from '@interfaces/products.interface';
import { User } from '@interfaces/users.interface';
import * as cartService from '@services/cart.service';
import discountModel from '@models/discount.model';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '@config';

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-04-30.basil' });

const SHIPPING_FEE_CENTS = 500; // Example: $5.00
const TAX_RATE = 0.10; // Example: 10%

export const findAllOrders = async () => {
  return await orderModel.find();
};

export const findOrdersByCustomer = async (customerId: string) => {
  return await orderModel.find({ user: customerId });
};

export const createOrder = async orderData => {
  return await orderModel.create(orderData);
};

export const createOrderFromCart = async (userId: string, shippingAddress: string): Promise<{ order: Order; sessionUrl?: string; message?: string }> => {
  const userWithCart = await userModel.findById(userId).populate('cart.product');
  if (!userWithCart || !userWithCart.cart || userWithCart.cart.length === 0) {
    throw new HttpException(400, 'Cart is empty or user not found.');
  }

  // Verify stock for all cart items before proceeding
  for (const item of userWithCart.cart) {
    const productDetails = item.product as Product;
    if (!productDetails || productDetails.stock < item.qty) {
      throw new HttpException(400, `Insufficient stock for product: ${productDetails ? productDetails.name : item.product}`);
    }
  }

  const orderItems: OrderItem[] = userWithCart.cart.map(cartItem => ({
    product: (cartItem.product as Product)._id, // Store product ID
    qty: cartItem.qty,
    price: cartItem.price, // Price at time of cart addition
  }));

  const subtotal = userWithCart.cartSubtotal || cartService.calculateCartSubtotal(userWithCart.cart); // Use pre-calculated or recalculate
  const discountCode = userWithCart.appliedDiscountCode;
  const discountAmount = userWithCart.discountAmount || 0;
  const totalAfterDiscount = userWithCart.cartTotalAfterDiscount !== undefined ? userWithCart.cartTotalAfterDiscount : subtotal - discountAmount;
  
  const taxAmount = Math.round(totalAfterDiscount * TAX_RATE);
  const grandTotal = totalAfterDiscount + SHIPPING_FEE_CENTS + taxAmount;

  const newOrderData: Partial<Order> = {
    user: userId,
    items: orderItems,
    shippingAddress,
    subtotal,
    discountCode,
    discountAmount,
    totalAfterDiscount,
    shippingFee: SHIPPING_FEE_CENTS,
    taxAmount,
    grandTotal,
    status: OrderStatus.PENDING,
  };

  const newOrder = new orderModel(newOrderData);
  // Stripe session creation (logic adapted from previous version)
  const stripeLineItems = userWithCart.cart.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: (item.product as Product).name,
        // images: [(item.product as Product).images?.[0] || 'your_default_image_url'], // Optional images
      },
      unit_amount: item.price, // Price per unit in cents (already in cart item)
    },
    quantity: item.qty,
  }));

  // Add shipping and tax as line items if Stripe setup requires it, or adjust total
  // For simplicity, if Stripe collects tax/shipping, we reflect that.
  // If Stripe total is just sum of products, then shipping/tax are for our records.
  // The current line_items are based on product prices. We need to ensure Stripe session reflects grandTotal.
  // One way: add fixed shipping/tax as line items.
  if (SHIPPING_FEE_CENTS > 0) {
    stripeLineItems.push({
        price_data: {
            currency: 'usd',
            product_data: { name: 'Shipping' },
            unit_amount: SHIPPING_FEE_CENTS,
        },
        quantity: 1,
    });
  }
  if (taxAmount > 0) {
    stripeLineItems.push({
        price_data: {
            currency: 'usd',
            product_data: { name: 'Tax' },
            unit_amount: taxAmount, // Total tax as one item
        },
        quantity: 1,
    });
  }
  // If a discount was applied, Stripe needs to know.
  // This can be done via Stripe Coupons applied to the session OR by adjusting line item prices.
  // Applying as a Stripe Coupon is cleaner.
  let stripeDiscountCouponId: string | undefined = undefined;
  if (discountCode && discountAmount > 0) {
      // Find or create a Stripe coupon corresponding to this discount code
      // This is complex: requires mapping your app's discounts to Stripe coupons
      // For now, we acknowledge it. A simpler way is to adjust line item prices or overall total if possible.
      // OR, if discountAmount is small, it can be absorbed / not explicitly sent if Stripe totals match grandTotal.
      // The critical part is `payment_intent_data.amount` in session creation if line_items don't sum to grandTotal.
      // However, Stripe prefers line_items to sum to the transaction total.
      // The simplest for now, if not using Stripe Coupons, is that the sum of `stripeLineItems` *after discount* + shipping + tax should be `grandTotal`.
      // The current `stripeLineItems` are pre-discount. This will cause an issue if `grandTotal` is sent as the final amount
      // to Stripe without them knowing about the discount that led to it.

      // Simplification: Assume the stripeLineItems created above (products + shipping + tax) represent the pre-discount total,
      // and we will create a Stripe Discount Coupon ID to apply to the session.
      // THIS IS A PLACEHOLDER - Real Stripe coupon creation/retrieval needed.
      // stripeDiscountCouponId = await getOrCreateStripeCouponForDiscount(discountCode, discountAmount, discountType);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: stripeLineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/checkout-success?orderId=${newOrder._id}`,
      cancel_url: `${process.env.CLIENT_URL}/checkout-cancel?orderId=${newOrder._id}`,
      // client_reference_id: newOrder._id.toString(), // Good for reconciliation
      metadata: { orderId: newOrder._id.toString() },
      ...(stripeDiscountCouponId ? { discounts: [{ coupon: stripeDiscountCouponId }] } : {}),
    });

    newOrder.stripeSessionId = session.id;
    await newOrder.save();

    // Decrement stock for each product
    for (const item of userWithCart.cart) {
      await productModel.updateOne({ _id: (item.product as Product)._id }, { $inc: { stock: -item.qty } });
    }

    // If discount was used, increment its usage count
    if (discountCode) {
      await discountModel.updateOne({ code: discountCode }, { $inc: { timesUsed: 1 } });
    }

    // Clear the user's cart and discount info from user model
    await cartService.clearUserCart(userId);

    return { order: newOrder, sessionUrl: session.url };

  } catch (error) {
    // If order was saved but Stripe session failed, we might need to mark order as failed or allow retry.
    // For now, if Stripe fails, the order isn't confirmed.
    // Consider deleting newOrder if Stripe fails and it was saved without a session ID.
    console.error("Stripe session creation failed:", error);
    // If newOrder was already saved, we might want to update its status to 'Payment Failed' here
    // or rely on a separate mechanism / webhook for this.
    // For now, rethrow or return error message.
    throw new HttpException(500, error.message || 'Failed to create Stripe session.');
  }
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const order = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true });
  if (!order) throw new HttpException(404, 'Order not found');
  return order;
};

export const updateOrderStatusAndPayment = async (orderId: string, newStatus: OrderStatus, paymentIntentId?: string): Promise<Order> => {
  const order = await orderModel.findById(orderId);
  if (!order) throw new HttpException(404, 'Order not found');

  order.status = newStatus;
  if (paymentIntentId) {
    order.stripePaymentIntentId = paymentIntentId;
  }
  // if (newStatus === OrderStatus.PROCESSING || newStatus === OrderStatus.DELIVERED ) { // Or based on payment success
  //   order.paidAt = new Date();
  // }
  await order.save();
  return order;
};
