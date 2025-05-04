import { Product } from '../models/product.model';
import mongoose from 'mongoose';
import { NODE_ENV, DB_URI } from '../config';

// Sample product data
const products = [
  {
    name: 'Denim Jacket',
    description: 'A stylish denim jacket for casual wear',
    price: 49.99,
    imageUrl: 'https://example.com/denim-jacket.jpg',
    category: 'denim',
    gender: 'unisex',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 60,
  },
  {
    name: 'Graphic T-Shirt',
    description: 'A comfortable graphic t-shirt',
    price: 19.99,
    imageUrl: 'https://example.com/graphic-tshirt.jpg',
    category: 'tshirt',
    gender: 'male',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 100,
  },
  {
    name: 'Hoodie',
    description: 'A warm and cozy hoodie',
    price: 39.99,
    imageUrl: 'https://example.com/hoodie.jpg',
    category: 'hoodie',
    gender: 'female',
    sizes: ['S', 'M', 'L'],
    stock: 40,
  },
  {
    name: 'Leather Belt',
    description: 'A classic leather belt',
    price: 29.99,
    imageUrl: 'https://example.com/leather-belt.jpg',
    category: 'accessory',
    gender: 'unisex',
    sizes: ['M', 'L'],
    stock: 80,
  },
  {
    name: 'Casual Sneakers',
    description: 'Comfortable sneakers for everyday use',
    price: 59.99,
    imageUrl: 'https://example.com/casual-sneakers.jpg',
    category: 'accessory',
    gender: 'unisex',
    sizes: ['7', '8', '9', '10'],
    stock: 50,
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(DB_URI || 'mongodb://localhost:27017/ecommerce', {});
    console.log('Connected to database');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    await Product.insertMany(products);
    console.log('Seeded products successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
