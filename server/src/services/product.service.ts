import { Product } from '../models/product.model';

export class ProductService {
  async getAllProducts(filters: { search?: string; category?: string; gender?: string } = {}): Promise<any> {
    const query: any = {};
    if (filters.search) {
      query.name = { $regex: filters.search, $options: 'i' };
    }
    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.gender) {
      query.gender = filters.gender;
    }
    return Product.find(query);
  }

  async getProductById(id: string): Promise<any> {
    return Product.findById(id);
  }

  async createProduct(data: any): Promise<any> {
    return new Product(data).save();
  }

  async updateProduct(id: string, data: any): Promise<any> {
    return Product.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteProduct(id: string): Promise<any> {
    return Product.findByIdAndDelete(id);
  }

  async countProducts(): Promise<number> {
    return Product.countDocuments();
  }
} 