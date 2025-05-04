import Stripe from 'stripe';

// Check if STRIPE_API_KEY is defined, otherwise use a fallback or mock for development
const stripeApiKey = process.env.STRIPE_API_KEY || 'mock_stripe_api_key';
const stripe = process.env.STRIPE_API_KEY ? new Stripe(stripeApiKey) : null;

export default stripe;

// Provide a mock function for checkout session creation if stripe is not initialized
export const createMockCheckoutSession = () => {
  return {
    url: 'http://localhost:mock-checkout-url',
    id: 'mock-session-id'
  };
}; 