import { config } from 'dotenv';
// Try loading from specific env file first, then fall back to .env
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });
export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const { NODE_ENV, PORT, DB_URI, SECRET_KEY, LOG_FORMAT, LOG_DIR, ORIGIN, stripe_secret_key, stripe_publishable_key } = process.env;
 
