// Assuming Product model is imported as 'productModel'
import { CreateProductDto } from '@dtos/products.dto';
import { HttpException } from '@exceptions/HttpException';
import { ProductNotFoundException } from '@exceptions/ProductNotFoundException';
import { Product } from '@interfaces/products.interface';
import productModel from '@models/products.model';
import { isEmpty } from '@utils/util';
import { logger } from '@utils/logger';
import { Types } from 'mongoose'; // Import Types for ObjectId

// Changed to accept query parameters for filtering
export const findAllProducts = async (queryParams: any = {}): Promise<Product[]> => {
  try {
    const filter: any = {};
    if (queryParams.search) {
      filter.name = { $regex: queryParams.search, $options: 'i' }; // Case-insensitive search by name
    }
    if (queryParams.category && queryParams.category !== 'all categories') { // Case-insensitive category filter
       filter.category = { $regex: queryParams.category, $options: 'i' };
    }
    if (queryParams.gender && queryParams.gender !== 'all genders') { // Case-insensitive gender filter
       filter.gender = { $regex: queryParams.gender, $options: 'i' };
    }


    // Consider adding pagination/sorting if needed for a large number of products

    const products: Product[] = await productModel.find(filter);
    return products;
  } catch (error) {
    logger.error('Error finding products:', error);
    throw error;
  }
}

// Changed to find by ID
export const findProductById = async (productId: string): Promise<Product> => {
  try {
    if (isEmpty(productId)) {
      throw new HttpException(400, 'productId is empty');
    }
    
    // Validate productId format if it's a string expected to be an ObjectId
    if (!Types.ObjectId.isValid(productId)) {
       throw new HttpException(400, 'Invalid product ID format');
    }

    const product: Product = await productModel.findById(productId); // Find by _id
    if (!product) throw new HttpException(404, `Product with ID ${productId} not found`); // Use ID in message
    
    return product;
  } catch (error) {
    // Log specific message for CastError if needed, but generic HttpException handling is often sufficient
     if (error instanceof Types.CastError) {
         logger.error(`CastError finding product by ID ${productId}:`, error.message);
     } else {
        logger.error(`Error finding product by ID ${productId}:`, error);
     }
    throw error; // Re-throw the caught error
  }
};

export const createProduct = async (productData: CreateProductDto): Promise<Product> => {
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
};

// Changed to update by ID
export const updateProduct = async (productId: string, productData: CreateProductDto): Promise<Product> => {
  try {
    if (isEmpty(productData)) {
      throw new HttpException(400, 'ProductData is empty');
    }

    // Validate productId format
     if (!Types.ObjectId.isValid(productId)) {
       throw new HttpException(400, 'Invalid product ID format');
    }

    const updateProductData: Product = await productModel.findByIdAndUpdate( // Find and update by ID
      productId,
      { $set: productData }, // Use $set to update specific fields
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );
    
    if (!updateProductData) throw new HttpException(404, `Product with ID ${productId} not found`); // Use ID in message
    
    return updateProductData;
  } catch (error) {
     if (error instanceof Types.CastError) {
         logger.error(`CastError updating product by ID ${productId}:`, error.message);
     } else {
        logger.error(`Error updating product ${productId}:`, error);
     }
    throw error;
  }
};

// Changed to delete by ID
export const deleteProduct = async (productId: string): Promise<Product> => {
  try {
     // Validate productId format
     if (!Types.ObjectId.isValid(productId)) {
       throw new HttpException(400, 'Invalid product ID format');
    }

    const deleteProductData: Product = await productModel.findByIdAndDelete(productId); // Find and delete by ID
    if (!deleteProductData) throw new HttpException(404, `Product with ID ${productId} not found`); // Use ID in message
    
    return deleteProductData;
  } catch (error) {
     if (error instanceof Types.CastError) {
         logger.error(`CastError deleting product by ID ${productId}:`, error.message);
     } else {
        logger.error(`Error deleting product ${productId}:`, error);
     }
    throw error;
  }
};