import express from 'express';
import checkoutController from '../controllers/checkoutController';

const router = express.Router();

// Route for creating checkout session
router.post('/create-session', checkoutController.createCheckoutSession);

// Route for Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), checkoutController.handleWebhook);

export default router; 