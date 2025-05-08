// Assuming Product model is imported as 'productModel'
import { CreateProductDto } from '@dtos/products.dto';
import { HttpException } from '@exceptions/HttpException';
import { Product, ProductDocument } from '@interfaces/products.interface';
import productModel from '@models/products.model';
import { isEmpty } from '@utils/util';
import { logger } from '@utils/logger';
import { Types, Document } from 'mongoose';
import { CastError } from 'mongoose'; // Keep importing CastError

// Function to check if an error is a Mongoose CastError by name
function isCastError(error: any): error is Error {
    // Check if it's an Error object and if its name property is 'CastError'
    return error instanceof Error && (error as any).name === 'CastError';
}


export const findAllProducts = async (queryParams: any = {}): Promise<Product[]> => {
  try {
    const filter: any = {};
    if (queryParams.search) {
      filter.name = { $regex: queryParams.search, $options: 'i' };
    }
    if (queryParams.category && queryParams.category !== 'all categories') {
       filter.category = { $regex: queryParams.category, $options: 'i' };
    }
    if (queryParams.gender && queryParams.gender !== 'all genders') {
       filter.gender = { $regex: queryParams.gender, $options: 'i' };
    }

    const products: ProductDocument[] = await productModel.find(filter);
    return products.map(product => product.toObject({ getters: true }));
  } catch (error) {
    logger.error('Error finding products:', error);
     if (error instanceof HttpException) {
        throw error;
     }
     else {
       throw new HttpException(500, 'Failed to find products');
     }
  }
}

export const findProductById = async (productId: string): Promise<Product> => {
  try {
    if (isEmpty(productId)) {
      throw new HttpException(400, 'productId is empty');
    }

    if (!Types.ObjectId.isValid(productId)) {
       throw new HttpException(400, 'Invalid product ID format');
    }

    const product = await productModel.findById(productId).populate('reviews.user', 'name') as (Product & Document) | null;
    if (!product) throw new HttpException(404, `Product with ID ${productId} not found`);

    return product.toObject({ getters: true });
  } catch (error) {
     // Using the helper function to check for CastError
     if (isCastError(error)) {
         logger.error(`CastError finding product by ID ${productId}: ${error.message}`);
          throw new HttpException(400, `Invalid product ID format: ${productId}`);
     } else {
        logger.error(`Error finding product by ID ${productId}:`, error);
         if (error instanceof HttpException) {
            throw error;
         }
         else {
           throw new HttpException(500, 'Failed to find product');
         }
     }
  }
};

export const createProduct = async (productData: CreateProductDto): Promise<Product> => {
  try {
    if (isEmpty(productData)) {
      throw new HttpException(400, 'ProductData is empty');
    }

    const existingProduct = await productModel.findOne({ name: productData.name });
    if (existingProduct) {
      throw new HttpException(409, `Product with name ${productData.name} already exists`);
    }

    const createProductData = await productModel.create(productData);
    return createProductData.toObject({ getters: true });
  } catch (error) {
    logger.error('Error creating product:', error);
     if (error instanceof HttpException) {
        throw error;
     }
     else {
       throw new HttpException(500, 'Failed to create product');
     }
  }
};

export const updateProduct = async (productId: string, productData: CreateProductDto): Promise<Product> => {
  try {
    if (isEmpty(productData)) {
      throw new HttpException(400, 'ProductData is empty');
    }

     if (!Types.ObjectId.isValid(productId)) {
       throw new HttpException(400, 'Invalid product ID format');
    }

    if (productData.name) {
      const existingProduct = await productModel.findOne({ name: productData.name });
      if (existingProduct && existingProduct._id.toString() !== productId) {
        throw new HttpException(409, `Product with name ${productData.name} already exists`);
      }
    }

    // Ensure productData object only contains fields valid for product update.
    // The DTO 'CreateProductDto' seems appropriate here for specifying allowed update fields.
    // If the DTO had sensitive user fields like password, remove them here.

    const updateProductData = await productModel.findByIdAndUpdate(
      productId,
      { $set: productData },
      { new: true, runValidators: true }
    ) as (Product & Document) | null;

    if (!updateProductData) throw new HttpException(404, `Product with ID ${productId} not found`);

    return updateProductData.toObject({ getters: true });
  } catch (error) {
     // Using the helper function to check for CastError
     if (isCastError(error)) {
         logger.error(`CastError updating product by ID ${productId}: ${error.message}`);
          throw new HttpException(400, `Invalid product ID format: ${productId}`);
     } else {
        logger.error(`Error updating product ${productId}:`, error);
         if (error instanceof HttpException) {
            throw error;
         }
         else {
           throw new HttpException(500, 'Failed to update product');
         }
     }
  }
};

export const deleteProduct = async (productId: string): Promise<Product> => {
  try {
     if (!Types.ObjectId.isValid(productId)) {
       throw new HttpException(400, 'Invalid product ID format');
    }

    const deleteProductData = await productModel.findByIdAndDelete(productId) as (Product & Document) | null;
    if (!deleteProductData) throw new HttpException(404, `Product with ID ${productId} not found`);

    return deleteProductData.toObject({ getters: true });
  } catch (error) {
     // Using the helper function to check for CastError
     if (isCastError(error)) {
         logger.error(`CastError deleting product by ID ${productId}: ${error.message}`);
          throw new HttpException(400, `Invalid product ID format: ${productId}`);
     } else {
        logger.error(`Error deleting product ${productId}:`, error);
         if (error instanceof HttpException) {
            throw error;
         }
         else {
           throw new HttpException(500, 'Failed to delete product');
         }
     }
  }
};