import { Request, Response } from 'express';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-04-30.basil',
});

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { items, shipping, shippingMethod, shippingCost } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Transform cart items to Stripe line items
    const lineItems = items.map((item: any) => {
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: `Size: ${item.size}`,
            images: [item.imageUrl],
            metadata: {
              productId: item.id,
              size: item.size
            },
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Add shipping cost as a separate line item
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${shippingMethod === 'express' ? 'Express' : 'Standard'} Shipping`,
            description: `${shippingMethod === 'express' ? 'Expedited' : 'Standard'} shipping service`,
          },
          unit_amount: Math.round(shippingCost * 100), // Convert to cents
        },
        quantity: 1,
      });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU'],
      },
      metadata: {
        order_data: JSON.stringify({
          items,
          shipping,
          shippingMethod,
          shippingCost,
        }),
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  if (!sig) {
    return res.status(400).json({ error: 'No Stripe signature found' });
  }

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Process order from session.metadata.order_data
      // Note: In a real application, you would create the order in your database here
      console.log('Payment successful, processing order:', session.metadata?.order_data);
      
      // You would typically:
      // 1. Create an order record in your database
      // 2. Update inventory
      // 3. Send confirmation email to customer
      // 4. etc.
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook signature verification failed' });
  }
};

export default {
  createCheckoutSession,
  handleWebhook,
}; 