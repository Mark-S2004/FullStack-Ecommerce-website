// products.route.ts
import { Router } from 'express';
import * as productsController from '@controllers/products.controller';
import { CreateProductDto } from '@dtos/products.dto';
import validationMiddleware from '@middlewares/validation.middleware';
import { Routes } from '@interfaces/routes.interface';

class ProductsRoute implements Routes {
  public path = '/products';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, productsController.getProducts);
    this.router.get(`${this.path}/:name`, productsController.getProductByName);
    this.router.post(`${this.path}`, validationMiddleware(CreateProductDto, 'body'), productsController.createProduct);
    this.router.put(`${this.path}/:name`, validationMiddleware(CreateProductDto, 'body', true), productsController.updateProduct);
    this.router.delete(`${this.path}/:name`, productsController.deleteProduct);
  }
}

export default ProductsRoute;
