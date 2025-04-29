// Product type definition
type Product = {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  gender: string;
  imageUrl: string;
  stock: number;
};

// Mock data
const mockProducts: Product[] = [
  {
    _id: 'p1',
    name: 'Running Shoes',
    price: 89.99,
    description: 'Comfortable running shoes for daily use',
    category: 'Footwear',
    gender: 'Unisex',
    imageUrl: 'https://via.placeholder.com/150',
    stock: 45
  },
  {
    _id: 'p2',
    name: 'Yoga Mat',
    price: 39.99,
    description: 'High-quality yoga mat with extra cushioning',
    category: 'Accessories',
    gender: 'Unisex',
    imageUrl: 'https://via.placeholder.com/150',
    stock: 30
  },
  {
    _id: 'p3',
    name: 'Denim Jacket',
    price: 59.99,
    description: 'Classic denim jacket for all seasons',
    category: 'denim',
    gender: 'male',
    imageUrl: 'https://via.placeholder.com/150',
    stock: 20
  },
  {
    _id: 'p4',
    name: 'Quarter-Zip Pullover',
    price: 49.99,
    description: 'Comfortable quarter-zip pullover for casual wear',
    category: 'quarter-zip',
    gender: 'female',
    imageUrl: 'https://via.placeholder.com/150',
    stock: 15
  }
];

// Product creation/update type
type ProductInput = Omit<Product, '_id'>;

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchProducts = async (search?: string) => {
  // Simulate API delay
  await delay(500);
  
  if (search) {
    return mockProducts.filter(product => 
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase()) ||
      product.category.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  return mockProducts;
};

export const createProduct = async (data: ProductInput): Promise<Product> => {
  // Simulate API delay
  await delay(500);
  
  const newProduct = {
    _id: `p${Math.floor(Math.random() * 10000)}`,
    ...data
  };
  
  mockProducts.push(newProduct);
  return newProduct;
};

export const updateProduct = async (id: string, data: Partial<ProductInput>): Promise<Product> => {
  // Simulate API delay
  await delay(500);
  
  const index = mockProducts.findIndex(p => p._id === id);
  if (index === -1) {
    throw new Error('Product not found');
  }
  
  mockProducts[index] = { 
    ...mockProducts[index], 
    ...data 
  };
  
  return mockProducts[index];
};

export const deleteProduct = async (id: string): Promise<void> => {
  // Simulate API delay
  await delay(500);
  
  const index = mockProducts.findIndex(p => p._id === id);
  if (index !== -1) {
    mockProducts.splice(index, 1);
  }
};

export const getProductById = async (id: string): Promise<Product> => {
  // Simulate API delay
  await delay(500);
  
  const product = mockProducts.find(p => p._id === id);
  if (!product) {
    throw new Error('Product not found');
  }
  
  return product;
};
