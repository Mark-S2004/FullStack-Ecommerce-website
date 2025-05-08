// Assuming Product model is imported as 'productModel'
import { CreateProductDto } from '@dtos/products.dto';
import { HttpException } from '@exceptions/HttpException';
// Removed unused ProductNotFoundException as HttpException is used directly
// import { ProductNotFoundException } from '@exceptions/ProductNotFoundException';
// Correct imports for Product interface
import { Product } from '@interfaces/orders.interface'; // Correct import path for Product
import productModel from '@models/products.model';
import { isEmpty } from '@utils/util';
import { logger } from '@utils/logger';
// Correct import for Types and CastError as values from mongoose
import { Types, CastError } from 'mongoose'; // Import Types and CastError as values


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

    // Find products matching the filter
    const products: Product[] = await productModel.find(filter);
    return products;
  } catch (error) {
    logger.error('Error finding products:', error);
    throw error; // Re-throw the error
  }
}

// Changed to find by ID
export const findProductById = async (productId: string): Promise<Product> => {
  try {
    if (isEmpty(productId)) {
      throw new HttpException(400, 'productId is empty');
    }

    // Validate productId format if it's a string expected to be an ObjectId
    if (!Types.ObjectId.isValid(productId)) { // Use imported Types
       throw new HttpException(400, 'Invalid product ID format');
    }

    // Find by _id and potentially populate reviews if needed
    const product: Product | null = await productModel.findById(productId).populate('reviews.user', 'name'); // Find by _id, Populate user name in reviews, result can be null
    if (!product) throw new HttpException(404, `Product with ID ${productId} not found`); // Use ID in message

    return product;
  } catch (error) {
    // Log specific message for CastError if needed, but generic HttpException handling is often sufficient
     if (error instanceof CastError) { // Use imported CastError as a value in instanceof
         logger.error(`CastError finding product by ID ${productId}: ${error.message}`); // Log the error message
     } else {
        logger.error(`Error finding product by ID ${productId}:`, error); // Log the full error object
     }
    // Re-throw the error, wrapped in HttpException if it wasn't already
     if (error instanceof HttpException) {
        throw error;
     } else if (error instanceof CastError) { // Specific handling for CastError
         throw new HttpException(400, `Invalid product ID: ${productId}`);
     }
     else {
       throw new HttpException(500, 'Failed to find product');
     }
  }
};

export const createProduct = async (productData: CreateProductDto): Promise<Product> => {
  try {
    if (isEmpty(productData)) {
      throw new HttpException(400, 'ProductData is empty');
    }

    const existingProduct: Product | null = await productModel.findOne({ name: productData.name }); // Result can be null
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
     if (!Types.ObjectId.isValid(productId)) { // Use imported Types
       throw new HttpException(400, 'Invalid product ID format');
    }

    // Check if email change conflicts with existing user (if email is part of productData, which it shouldn't be)
    // Removed user-specific email check from here, as this is a product service.

    // Hash password if provided (shouldn't be for products, but defensive check based on original code)
    // Removed password hashing logic - this is product service

    const updateProductData: Product | null = await productModel.findByIdAndUpdate( // Find and update by ID, result can be null
      productId,
      { $set: productData }, // Use $set to update specific fields
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!updateProductData) throw new HttpException(404, `Product with ID ${productId} not found`); // Use ID in message

    return updateProductData;
  } catch (error) {
     if (error instanceof CastError) { // Use imported CastError as a value in instanceof
         logger.error(`CastError updating product by ID ${productId}: ${error.message}`);
     } else {
        logger.error(`Error updating product ${productId}:`, error);
     }
     if (error instanceof HttpException) {
        throw error;
     }
     else {
       throw new HttpException(500, 'Failed to update product');
     }
  }
};

// Changed to delete by ID
export const deleteProduct = async (productId: string): Promise<Product> => {
  try {
     // Validate productId format
     if (!Types.ObjectId.isValid(productId)) { // Use imported Types
       throw new HttpException(400, 'Invalid product ID format');
    }

    const deleteProductData: Product | null = await productModel.findByIdAndDelete(productId); // Find and delete by ID, result can be null
    if (!deleteProductData) throw new HttpException(404, `Product with ID ${productId} not found`); // Use ID in message

    return deleteProductData;
  } catch (error) {
     if (error instanceof CastError) { // Use imported CastError as a value in instanceof
         logger.error(`CastError deleting product by ID ${productId}: ${error.message}`);
     } else {
        logger.error(`Error deleting product ${productId}:`, error);
     }
     if (error instanceof HttpException) {
        throw error;
     }
     else {
       throw new HttpException(500, 'Failed to delete product');
     }
  }
};