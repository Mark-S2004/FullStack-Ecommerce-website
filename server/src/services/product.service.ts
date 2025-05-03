import { ProductModel } from '../models/product.model';

export class ProductService {
  static async create(data) {
    return ProductModel.create(data);
  }
  static async list(filter: any = {}, paging: { limit?: number; skip?: number } = {}) {
    const queryFilter: any = {};

    // Handle search filter
    if (filter.search) {
      queryFilter.name = { $regex: filter.search, $options: 'i' };
    }
    
    // Handle category filter (if not empty)
    if (filter.category) {
      queryFilter.category = filter.category;
    }

    // Handle gender filter (if not empty)
    if (filter.gender) {
      queryFilter.gender = filter.gender;
    }
    
    return ProductModel.find(queryFilter) // Use the constructed queryFilter
      .limit(paging.limit || 20)
      .skip(paging.skip || 0);
  }
  static async getById(id) {
    return ProductModel.findById(id);
  }
  static async update(id, data) {
    return ProductModel.findByIdAndUpdate(id, data, { new: true });
  }
  static async remove(id) {
    return ProductModel.findByIdAndDelete(id);
  }
}
