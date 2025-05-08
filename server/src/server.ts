import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env file at the very top
const envFile = `.env.${process.env.NODE_ENV || 'development'}.local`;
const envPath = path.resolve(process.cwd(), envFile);
dotenv.config({ path: envPath });

console.log(`server.ts: Loaded .env file from: ${envPath}`);
console.log(`server.ts: PORT after explicit load: ${process.env.PORT}`);

// Import required modules
// import 'dotenv/config'; // Rely on config/index.ts to load dotenv
import App from './app';
import validateEnv from './utils/validateEnv';

// Add detailed error handling
process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(error.name, error.message);
  console.error(error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(error); // Log the whole error object for unhandled rejections
  process.exit(1);
});

console.log('--- Pre-Try-Catch in server.ts ---');

try {
  console.log('Starting server initialization...');
  
  // Environment variables should be loaded by the import of App, which imports config/index.ts
  // Then validateEnv can be called.
  console.log('Validating environment variables...');
  validateEnv();
  
  console.log('Creating App instance...');
  const app = new App();

  console.log('Starting server...');
  app.listen();
  console.log('--- End of Try-Catch (App is now active) ---');
} catch (error) {
  console.error('Server initialization failed with error:', error);
  
  if (error instanceof Error) {
    console.error('Stack trace:', error.stack);
  }
  
  process.exit(1);
}

console.log('--- Script End in server.ts (App is now active) ---');