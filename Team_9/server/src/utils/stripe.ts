// server/src/utils/stripe.ts
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '../config'; // Import the loaded variable

// Initialize Stripe using the loaded secret key and latest API version
const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion // Use latest version and cast to type
});

export default stripe;

// Also export as named export for compatibility with existing code
export const stripeClient = stripe;