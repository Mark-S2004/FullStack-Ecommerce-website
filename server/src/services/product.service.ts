import { HttpException } from '../exceptions/HttpException';
import productModel from '../models/products.model';
import { Product } from '../interfaces/products.interface';
import { CreateProductDto } from '../dtos/products.dto'; // Assuming you might use this elsewhere

export const findAllProduct = async (query: any = {}): Promise<Product[]> => {
  let conditions: any = {};
  if (query.name) {
    conditions.name = { $regex: query.name, $options: 'i' };
  }
  if (query.category) {
    conditions.category = query.category;
  }
  if (query.gender) {
    conditions.gender = query.gender;
  }
  if (query.minPrice) {
    conditions.price = { ...(conditions.price || {}), $gte: parseFloat(query.minPrice) };
  }
  if (query.maxPrice) {
    conditions.price = { ...(conditions.price || {}), $lte: parseFloat(query.maxPrice) };
  }

  const products: Product[] = await productModel.find(conditions).populate('reviews');
  return products;
};

export const findProductByName = async (productName: string): Promise<Product> => {
  const findProduct: Product | null = await productModel.findOne({ name: productName }).populate('reviews');
  if (!findProduct) throw new HttpException(404, "Product doesn't exist");
  return findProduct;
};

export const createProduct = async (productData: CreateProductDto): Promise<Product> => {
  const createProductData: Product = await productModel.create(productData);
  return createProductData;
};

export const updateProduct = async (productName: string, productData: CreateProductDto): Promise<Product> => {
  const updateProductByName: Product | null = await productModel.findOneAndUpdate(
    { name: productName },
    productData,
    { new: true, runValidators: true }
  );
  if (!updateProductByName) throw new HttpException(404, "Product doesn't exist");
  return updateProductByName;
};

export const deleteProductData = async (productName: string): Promise<Product> => {
  const deleteProductByName: Product | null = await productModel.findOneAndDelete({ name: productName });
  if (!deleteProductByName) throw new HttpException(404, "Product doesn't exist");
  return deleteProductByName;
}; 