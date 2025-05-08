import { Request, Response } from 'express';
import stripe from '../utils/stripe';
import * as orderService from '../services/order.service';
import { OrderStatus } from '@interfaces/orders.interface';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '@config';

const stripeInstance = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2025-04-30.basil' }); // Match service version

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripeInstance.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

      if (orderId) {
        console.log(`Checkout session completed for orderId: ${orderId}`);
        // Payment is successful, update order status to 'Processing' (or your equivalent for paid)
        // and store paymentIntentId
        try {
          await orderService.updateOrderStatusAndPayment(orderId, OrderStatus.PROCESSING, paymentIntentId);
          console.log(`Order ${orderId} status updated to Processing.`);
        } catch (error) {
          console.error(`Error updating order ${orderId} status after webhook:`, error);
          // Decide if you need to retry or flag for manual intervention
        }
      } else {
        console.error('checkout.session.completed event without orderId in metadata', session);
      }
      break;

    case 'checkout.session.async_payment_failed':
    case 'checkout.session.expired': // Consider this a failure for the order
      const failedSession = event.data.object as Stripe.Checkout.Session;
      const failedOrderId = failedSession.metadata?.orderId;
      if (failedOrderId) {
        console.log(`Checkout session failed or expired for orderId: ${failedOrderId}, event: ${event.type}`);
        try {
          await orderService.updateOrderStatusAndPayment(failedOrderId, OrderStatus.PAYMENT_FAILED);
          console.log(`Order ${failedOrderId} status updated to Payment Failed.`);
        } catch (error) {
          console.error(`Error updating order ${failedOrderId} to Payment Failed:`, error);
        }
      }
      break;

    // Add other event types to handle if needed (e.g., payment_intent.succeeded, payment_intent.payment_failed)
    // especially if you have payment methods beyond simple card checkout sessions.

    default:
      console.log(`Unhandled Stripe event type ${event.type}`);
  }

  res.json({ received: true });
};
