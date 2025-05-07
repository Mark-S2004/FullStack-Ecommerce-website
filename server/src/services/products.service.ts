import { CreateProductDto } from '@dtos/products.dto';
import { HttpException } from '@exceptions/HttpException';
import { ProductNotFoundException } from '@exceptions/ProductNotFoundException';
import { Product } from '@interfaces/products.interface';
import productModel from '@models/products.model';
import { isEmpty } from '@utils/util';
import { logger } from '@utils/logger';

class ProductsService {
  public async findAllProducts(): Promise<Product[]> {
    try {
      const products: Product[] = await productModel.find();
      return products;
    } catch (error) {
      logger.error('Error finding products:', error);
      throw error;
    }
  }

  public async findProductByName(productName: string): Promise<Product> {
    try {
      if (isEmpty(productName)) {
        throw new HttpException(400, 'ProductName is empty');
      }

      const product: Product = await productModel.findOne({ name: productName });
      if (!product) throw new ProductNotFoundException(productName);
      
      return product;
    } catch (error) {
      logger.error(`Error finding product by name ${productName}:`, error);
      throw error;
    }
  }

  public async createProduct(productData: CreateProductDto): Promise<Product> {
    try {
      if (isEmpty(productData)) {
        throw new HttpException(400, 'ProductData is empty');
      }

      const existingProduct: Product = await productModel.findOne({ name: productData.name });
      if (existingProduct) {
        throw new HttpException(409, `Product with name ${productData.name} already exists`);
      }

      const createProductData: Product = await productModel.create(productData);
      return createProductData;
    } catch (error) {
      logger.error('Error creating product:', error);
      throw error;
    }
  }

  public async updateProduct(productName: string, productData: CreateProductDto): Promise<Product> {
    try {
      if (isEmpty(productData)) {
        throw new HttpException(400, 'ProductData is empty');
      }

      const updateProductData: Product = await productModel.findOneAndUpdate(
        { name: productName },
        { ...productData },
        { new: true }
      );
      
      if (!updateProductData) throw new ProductNotFoundException(productName);
      
      return updateProductData;
    } catch (error) {
      logger.error(`Error updating product ${productName}:`, error);
      throw error;
    }
  }

  public async deleteProduct(productName: string): Promise<Product> {
    try {
      const deleteProductData: Product = await productModel.findOneAndDelete({ name: productName });
      if (!deleteProductData) throw new ProductNotFoundException(productName);
      
      return deleteProductData;
    } catch (error) {
      logger.error(`Error deleting product ${productName}:`, error);
      throw error;
    }
  }
}

export default ProductsService;
