import { connect, disconnect } from 'mongoose';
import productModel from '../models/products.model';

/**
 * This script adds a 'category' field to all products in the database
 * Run with: npx ts-node -r tsconfig-paths/register src/scripts/addCategoryToProducts.ts
 */

// Available categories to randomly assign
const categories = ['Men', 'Women', 'Kids', 'Accessories', 'Electronics'];

// MongoDB connection string - Update this to match your MongoDB URI in your env file
const DB_URI = 'mongodb://localhost:27017/ecommerce';

async function addCategoryToProducts() {
  try {
    console.log('Connecting to database...');
    await connect(DB_URI);
    console.log('Database connection successful.');
    
    // Find all products that don't have a category
    const productsWithoutCategory = await productModel.find({ category: { $exists: false } });
    console.log(`Found ${productsWithoutCategory.length} products without category.`);
    
    // Also get products with empty category strings to fix those
    const productsWithEmptyCategory = await productModel.find({ category: "" });
    console.log(`Found ${productsWithEmptyCategory.length} products with empty category.`);
    
    // Combine the results
    const productsToUpdate = [...productsWithoutCategory, ...productsWithEmptyCategory];
    
    // Track how many were updated
    let updatedCount = 0;
    
    // Update each product with a random category
    for (const product of productsToUpdate) {
      // Get a random category from the list
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      // Update the product with the random category
      product.category = randomCategory;
      await product.save();
      
      console.log(`Updated product "${product.name}" with category "${randomCategory}"`);
      updatedCount++;
    }
    
    console.log(`Successfully updated ${updatedCount} products with categories.`);
    
  } catch (error) {
    console.error('Error updating products with categories:', error);
  } finally {
    await disconnect();
    console.log('Database connection closed.');
  }
}

// Run the script
addCategoryToProducts(); 