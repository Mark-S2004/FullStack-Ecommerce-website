import { ProductModel } from '../models/product.model';

export class ProductService {
  static async create(data) {
    return ProductModel.create(data);
  }
  static async list(filter: any = {}, paging: { limit?: number; skip?: number } = {}) {
    return ProductModel.find(filter)
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
