import { CreateProductDto } from '@dtos/products.dto';
import { HttpException } from '@exceptions/HttpException';
import { Product } from '@interfaces/products.interface';
import productModel from '@models/products.model';
import { isEmpty } from '@utils/util';

export const findAllProduct = async (): Promise<Product[]> => {
  const Products: Product[] = await productModel.find();
  return Products;
};

export const findProductByName = async (productName: string): Promise<Product> => {
  if (isEmpty(productName)) {
    throw new HttpException(400, 'productName is empty');
  }

  const findProduct: Product = await productModel.findOne({ name: productName });
  if (!findProduct) {
    throw new HttpException(409, "Product doesn't exist");
  }

  return findProduct;
};

export const createProduct = async (productData: CreateProductDto): Promise<Product> => {
  if (isEmpty(productData)) {
    throw new HttpException(400, 'productData is empty');
  }

  const findProduct: Product = await productModel.findOne({ name: productData.name });
  if (findProduct) {
    throw new HttpException(409, `This name ${productData.name} already exists`);
  }

  const createProductData: Product = await productModel.create(productData);

  return createProductData;
};

export const updateProduct = async (productName: string, productData: CreateProductDto): Promise<Product> => {
  if (isEmpty(productData)) {
    throw new HttpException(400, 'productData is empty');
  }

  const updateProductById: Product = await productModel.findOneAndUpdate({ name: productName }, productData);
  if (!updateProductById) {
    throw new HttpException(409, "Product doesn't exist");
  }

  return updateProductById;
};

export const deleteProduct = async (productName: string): Promise<Product> => {
  const deleteProductById: Product = await productModel.findOneAndDelete({ name: productName });
  if (!deleteProductById) {
    throw new HttpException(409, "Product doesn't exist");
  }

  return deleteProductById;
};
