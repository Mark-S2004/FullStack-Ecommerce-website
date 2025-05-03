import axios from 'axios';

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

// Product creation/update type
type ProductInput = Omit<Product, '_id'>;

export const fetchProducts = async (search = '', category = '', gender = ''): Promise<Product[]> => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category) params.append('category', category);
  if (gender) params.append('gender', gender);
  try {
    const response = await axios.get(`/api/products?${params.toString()}`);
    // Ensure response.data.data exists and is an array, otherwise return empty array
    return Array.isArray(response.data.data) ? response.data.data : []; 
  } catch (error) {
    console.error('Error fetching products:', error);
    // Re-throw the error to be handled by React Query
    throw error;
  }
};

export const createProduct = async (data: ProductInput): Promise<Product> => {
  try {
    const response = await axios.post('/api/products', data);
    return response.data.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, data: Partial<ProductInput>): Promise<Product> => {
  try {
    const response = await axios.put(`/api/products/${id}`, data);
    return response.data.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  try {
    await axios.delete(`/api/products/${id}`);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await axios.get(`/api/products/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
};
