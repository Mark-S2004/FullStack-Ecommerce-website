import { Router } from 'express';
import * as productsController from '../controllers/products.controller';
import { CreateProductDto } from '../dtos/products.dto';
import validationMiddleware from '../middlewares/validation.middleware';

const path = '/products'; // Base path for product routes
const router = Router(); // Create the router

// Define routes relative to the base path ('/products')
// GET / is public based on index.ts needsAuth: false
router.get('/', productsController.getProducts); // Full path: /api/products
router.get('/:name', productsController.getProductByName); // Full path: /api/products/:name

// POST, PUT, DELETE for products are likely admin-only,
// they will hit authRequiredMiddleware in app.ts if needsAuth is true in index.ts
router.post('/', validationMiddleware(CreateProductDto, 'body'), productsController.createProduct); // Full path: /api/products
router.put('/:name', validationMiddleware(CreateProductDto, 'body', true), productsController.updateProduct); // Full path: /api/products/:name
router.delete('/:name', productsController.deleteProduct); // Full path: /api/products/:name

export default { path, router };