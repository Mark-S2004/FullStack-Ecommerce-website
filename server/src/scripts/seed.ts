// server/src/scripts/seed.ts
import { connect, disconnect } from 'mongoose';
import { dbConnection } from '../databases'; // Import DB connection config
import productModel from '../models/products.model'; // Import your product model
import { Product } from '../interfaces/products.interface'; // Import Product interface
import { logger } from '../utils/logger'; // Import logger
import validateEnv from '../utils/validateEnv'; // Import validateEnv

// Sample product data (keep it simple)
const sampleProducts: Partial<Product>[] = [
  {
    name: 'Cool T-Shirt',
    description: 'A comfortable and stylish cotton t-shirt.',
    price: 19.99,
    stock: 50,
  },
  {
    name: 'Classic Jeans',
    description: 'Durable denim jeans for everyday wear.',
    price: 45.50,
    stock: 30,
  },
  {
    name: 'Sneakers',
    description: 'Casual and sporty walking shoes.',
    price: 75.00,
    stock: 20,
  },
   {
    name: 'Summer Dress',
    description: 'Light and airy dress perfect for warm weather.',
    price: 35.75,
    stock: 15,
  },
   {
    name: 'Winter Coat',
    description: 'Warm and insulated coat for cold climates.',
    price: 120.00,
    stock: 10,
  },
];

async function seedDatabase() {
  try {
    validateEnv(); // Ensure env is loaded before connecting

    logger.info('Connecting to database for seeding...');
    // Connect to MongoDB using the connection details from config
    await connect(dbConnection.url);
    logger.info('Database connection successful.');

    logger.info('Starting product seeding...');

    for (const productData of sampleProducts) {
      // Check if product already exists to avoid duplicates
      const existingProduct = await productModel.findOne({ name: productData.name });

      if (existingProduct) {
        logger.info(`Product "${productData.name}" already exists. Skipping.`);
      } else {
        // Create the product document
        await productModel.create(productData);
        logger.info(`Product "${productData.name}" created successfully.`);
      }
    }

    logger.info('Product seeding finished.');

  } catch (error) {
    logger.error('Error during seeding:', error);
  } finally {
    // Disconnect from the database
    await disconnect();
    logger.info('Database connection closed.');
  }
}

// Run the seed function
seedDatabase();