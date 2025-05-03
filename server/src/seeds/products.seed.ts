import mongoose from 'mongoose';
import { ProductModel } from '../models/product.model';
import { dbConnection } from '../databases'; // Import connection options instead of a connect function
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const seedProducts = [
  {
    name: 'Classic Denim Jacket',
    description: 'A timeless denim jacket for all seasons.',
    price: 79.99,
    category: 'Clothing', // Changed from 'denim' to 'Clothing'
    gender: 'Unisex',
    sizes: ['S', 'M', 'L', 'XL'],
    imageUrl: 'https://via.placeholder.com/300x300?text=Denim+Jacket',
    stock: 50
  },
  {
    name: 'Cozy Hoodie',
    description: 'Soft and comfortable hoodie, perfect for relaxing.',
    price: 49.99,
    category: 'Clothing',
    gender: 'Unisex',
    sizes: ['S', 'M', 'L'],
    imageUrl: 'https://via.placeholder.com/300x300?text=Hoodie',
    stock: 75
  },
  {
    name: 'Leather Sneakers',
    description: 'Stylish leather sneakers for everyday wear.',
    price: 129.99,
    category: 'Footwear',
    gender: 'Male',
    sizes: ['8', '9', '10', '11', '12'],
    imageUrl: 'https://via.placeholder.com/300x300?text=Sneakers',
    stock: 40
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight and breathable running shoes.',
    price: 99.99,
    category: 'Footwear',
    gender: 'Female',
    sizes: ['6', '7', '8', '9'],
    imageUrl: 'https://via.placeholder.com/300x300?text=Running+Shoes',
    stock: 60
  },
  {
    name: 'Minimalist Watch',
    description: 'Elegant watch with a minimalist design.',
    price: 199.99,
    category: 'Accessories',
    gender: 'Unisex',
    sizes: [],
    imageUrl: 'https://via.placeholder.com/300x300?text=Watch',
    stock: 25
  },
  {
    name: 'Smart Home Speaker',
    description: 'Voice-controlled smart speaker for your home.',
    price: 89.00,
    category: 'Electronics',
    gender: 'Unisex',
    sizes: [],
    imageUrl: 'https://via.placeholder.com/300x300?text=Smart+Speaker',
    stock: 30
  },
];

const seedDB = async () => {
  try {
    // Connect directly using mongoose.connect with only the URL
    // Options like useNewUrlParser and useUnifiedTopology are deprecated in Mongoose 6+
    await mongoose.connect(dbConnection.url);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing products (optional, uncomment if needed)
    // await ProductModel.deleteMany({});
    // console.log('Existing products cleared.');

    await ProductModel.insertMany(seedProducts);
    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

seedDB(); 