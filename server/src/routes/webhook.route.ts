import { Router } from 'express';
import { handleStripeWebhook } from '../controllers/webhook.controller';
// Keep express imported if needed for raw body, but it's applied in app.ts now
// import express from 'express';

const path = '/stripe'; // Base path for webhook
const router = Router();

// Define routes relative to the base path ('/stripe')
// The raw body middleware is handled in app.ts for this specific route
router.post('/', handleStripeWebhook); // Full path: /api/stripe

export default { path, router };