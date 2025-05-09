// C:/Users/mdzhs/Downloads/ASU downlaods/New folder/mark's code 2/FullStack-Ecommerce-website/server\src\server.ts
import 'reflect-metadata';
  
process.on('uncaughtException', (err: Error) => {
    console.error('✖ Uncaught Exception:', err.stack || err.message);
  });
  process.on('unhandledRejection', (reason: any) => {
    console.error('✖ Unhandled Rejection:', reason);
  });
import App from '@/app';
import validateEnv from '@utils/validateEnv'; // Assuming validateEnv is in utils
validateEnv(); // Call validateEnv first to load .env into process.env

const app = new App(); // App constructor can now safely access process.env

app.listen();