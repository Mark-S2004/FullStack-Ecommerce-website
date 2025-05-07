// products.route.ts
import { Router } from 'express';
import * as productsController from '@controllers/products.controller';
import { CreateProductDto } from '@dtos/products.dto';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';

// Removed the class structure to align with other route files exporting objects
const path = '/products';
const router = Router();

// Change routes to use ID parameter instead of name
router.get(`${path}`, productsController.getProducts);
router.get(`${path}/:id`, productsController.getProductById); // Changed from :name
router.post(`${path}`, validationMiddleware(CreateProductDto, 'body'), productsController.createProduct);
router.put(`${path}/:id`, validationMiddleware(CreateProductDto, 'body', true), productsController.updateProduct); // Changed from :name
router.delete(`${path}/:id`, productsController.deleteProduct); // Changed from :name

// Export as a simple object
export default { path, router };