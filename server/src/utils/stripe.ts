// server/src/utils/stripe.ts
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '@config'; // Import the loaded variable

// Initialize Stripe using the loaded secret key and the CORRECT API version
const stripe = new Stripe(STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-04-30.basil' // Use the API version from the error message or latest compatible
});

export default stripe;