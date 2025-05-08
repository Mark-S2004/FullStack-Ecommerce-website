// C:/Users/mdzhs/Downloads/ASU downlaods/New folder/mark's code 2/FullStack-Ecommerce-website/server\src\config\index.ts
// import { config } from 'dotenv'; // Removed: dotenv will be loaded by server.ts
// import * as path from 'path'; // Removed

// // Load environment variables from .env file based on NODE_ENV // Removed
// const envFile = `.env.${process.env.NODE_ENV || 'development'}.local`; // Removed
// console.log(`Loading environment variables from: ${envFile}`); // Removed
// config({ path: path.resolve(process.cwd(), envFile) }); // Removed

// Debug environment variables (optional, can be useful)
console.log('Accessing environment variables in config/index.ts:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_URI:', process.env.DB_URI);
console.log('PORT from config/index.ts:', process.env.PORT);

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
// Read ORIGIN as a string, split by comma, trim whitespace, and filter out empty strings
const originsString = process.env.ORIGIN || ''; // Default to empty string if not set
export const ORIGIN = originsString.split(',').map(o => o.trim()).filter(Boolean);

export const { NODE_ENV, PORT, DB_URI, SECRET_KEY, LOG_FORMAT, LOG_DIR } = process.env;

// Note: process.env.STRIPE_SECRET_KEY, process.env.STRIPE_WEBHOOK_SECRET, process.env.CLIENT_URL
// are used directly in services/utils, you might want to add them here for consistency
export const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, CLIENT_URL } = process.env;