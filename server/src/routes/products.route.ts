import { Router } from 'express';
import * as productsController from '@controllers/products.controller';
import { CreateProductDto } from '@dtos/products.dto';
import validationMiddleware from '@middlewares/validation.middleware';

const path = '/products';
const router = Router();

router.get(`${path}`, productsController.getProducts);
router.get(`${path}/:name`, productsController.getProductByName);
router.post(`${path}`, validationMiddleware(CreateProductDto, 'body'), productsController.createProduct);
router.put(`${path}/:name`, validationMiddleware(CreateProductDto, 'body', true), productsController.updateProduct);
router.delete(`${path}/:name`, productsController.deleteProduct);

export default { path, router };
