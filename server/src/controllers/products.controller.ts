import { NextFunction, Request, Response } from 'express';
import { CreateProductDto } from '@dtos/products.dto';
import { Product } from '@interfaces/products.interface';
import * as productService from '@services/products.service'; // Assuming product service is now an object

// Renamed to reflect fetching by ID
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId: string = req.params.id; // Get ID from params
    const findOneProductData: Product = await productService.findProductById(productId); // Call service by ID

    res.status(200).json({ product: findOneProductData, message: 'findOne' }); // Return product wrapped in 'product' key
  } catch (error) {
    next(error);
  }
};

// Keep getProducts as is (fetches all or filtered)
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Assuming filter params (search, category, gender) are passed as query params
    const queryParams = req.query;
    const findAllProductsData: Product[] = await productService.findAllProducts(queryParams);

    res.status(200).json({ products: findAllProductsData, message: 'findAll' }); // Return products wrapped in 'products' key
  } catch (error) {
    next(error);
  }
};


export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ProductData: CreateProductDto = req.body;
    const createProductData: Product = await productService.createProduct(ProductData);

    res.status(201).json({ data: createProductData, message: 'created' });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId: string = req.params.id; // Changed to get ID
    const ProductData: CreateProductDto = req.body;
    const updateProductData: Product = await productService.updateProduct(productId, ProductData); // Pass ID

    res.status(200).json({ data: updateProductData, message: 'updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId: string = req.params.id; // Changed to get ID
    const deleteProductData: Product = await productService.deleteProduct(productId); // Pass ID

    res.status(200).json({ data: deleteProductData, message: 'deleted' });
  } catch (error) {
    next(error);
  }
};