import { Product } from '@/interfaces/products.interface';
import ProductModel from '@/models/products.model';
import { connect, disconnect } from 'mongoose';
import { dbConnection } from '@/databases';

const products: Partial<Product>[] = [
  {
    name: "Classic White Sneakers",
    description: "Versatile white sneakers perfect for any casual outfit",
    price: 79.99,
    category: "Shoes",
    gender: "Unisex",
    sizes: ["US 7", "US 8", "US 9", "US 10", "US 11"],
    colors: ["White"],
    images: ["https://example.com/white-sneakers.jpg"],
    stock: 50,
    reviews: [],
    totalRating: 0,
    reviewCount: 0
  },
  {
    name: "Slim Fit Denim Jeans",
    description: "Classic blue denim jeans with a modern slim fit",
    price: 59.99,
    category: "Pants",
    gender: "Men",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Blue", "Black"],
    images: ["https://example.com/slim-jeans.jpg"],
    stock: 100,
    reviews: [],
    totalRating: 0,
    reviewCount: 0
  },
  {
    name: "Summer Floral Dress",
    description: "Light and breezy floral dress perfect for summer",
    price: 49.99,
    category: "Dresses",
    gender: "Women",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Blue Floral", "Pink Floral"],
    images: ["https://example.com/floral-dress.jpg"],
    stock: 30,
    reviews: [],
    totalRating: 0,
    reviewCount: 0
  },
  {
    name: "Cotton Crew Neck T-Shirt",
    description: "Essential crew neck t-shirt made from premium cotton",
    price: 24.99,
    category: "T-Shirts",
    gender: "Unisex",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["White", "Black", "Gray", "Navy"],
    images: ["https://example.com/crew-tshirt.jpg"],
    stock: 200,
    reviews: [],
    totalRating: 0,
    reviewCount: 0
  },
  {
    name: "Leather Crossbody Bag",
    description: "Stylish leather crossbody bag with multiple compartments",
    price: 89.99,
    category: "Accessories",
    gender: "Women",
    sizes: ["One Size"],
    colors: ["Brown", "Black"],
    images: ["https://example.com/leather-bag.jpg"],
    stock: 25,
    reviews: [],
    totalRating: 0,
    reviewCount: 0
  }
];

async function seedProducts() {
  try {
    await connect(dbConnection.url);
    console.log('Connected to database');

    // Clear existing products
    await ProductModel.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    await ProductModel.insertMany(products);
    console.log('Successfully seeded products');

    await disconnect();
    console.log('Disconnected from database');
  } catch (error) {
    console.error('Error seeding products:', error);
    await disconnect();
  }
}

// Run seeder if this file is run directly
if (require.main === module) {
  seedProducts();
}

export { seedProducts }; 