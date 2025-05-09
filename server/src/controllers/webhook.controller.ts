import { Request, Response } from 'express';
import stripe from '../utils/stripe';
import * as orderService from '../services/order.service';

export async function handleStripeWebhook(req: Request, res: Response) {
  // Get the signature from the header
  const signature = req.headers['stripe-signature'] as string;

  try {
    // Verify the event using the signature and Stripe webhook secret
    const event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET as string);

    // Handle the event based on its type
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;

      // Extract orderId from metadata
      const { orderId } = session.metadata;

      if (orderId) {
        // Update order status to 'Confirmed'
        await orderService.updateOrderStatus(orderId, 'Confirmed');
        console.log(`Order ${orderId} status updated to Confirmed`);
      }
    }

    // Return success response
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
}
