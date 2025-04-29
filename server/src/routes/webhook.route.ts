import { Router } from 'express';
import { handleStripeWebhook } from '../controllers/webhook.controller';
import express from 'express';

const path = '/stripe';
const router = Router();

// Stripe needs the raw body to validate the event
router.post(`${path}`, express.raw({ type: 'application/json' }), handleStripeWebhook);

export default { path, router };
