import { Router } from 'express';
import { ProductController } from '@controllers/product.controller';
import { CreateProductDto } from '@dtos/products.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import authRequiredMiddleware from '@middlewares/authRequired.middleware';
import adminRequiredMiddleware from '@middlewares/authRequired.middleware';

export class ProductRoute implements Routes {
  public path = '/products';
  public router = Router();
  public productController = new ProductController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // GET /api/products (Public, optional filter)
    this.router.get(`${this.path}`, this.productController.getProducts);

    // GET /api/products/:name (Public)
    this.router.get(`${this.path}/:name`, this.productController.getProductByName);

    // POST /api/products (Admin only)
    this.router.post(
      `${this.path}`,
      adminRequiredMiddleware,
      validationMiddleware(CreateProductDto, 'body'),
      this.productController.createProduct,
    );

    // PUT /api/products/:name (Admin only)
    this.router.put(
      `${this.path}/:name`,
      adminRequiredMiddleware,
      validationMiddleware(CreateProductDto, 'body', true),
      this.productController.updateProduct,
    );

    // DELETE /api/products/:name (Admin only)
    this.router.delete(`${this.path}/:name`, adminRequiredMiddleware, this.productController.deleteProduct);

    // --- Review Routes ---

    // POST /api/products/:name/reviews (Customer only)
    this.router.post(`${this.path}/:name/reviews`, authRequiredMiddleware, this.productController.addReview);

    // DELETE /api/products/:name/reviews/:reviewId (Admin only)
    this.router.delete(`${this.path}/:name/reviews/:reviewId`, adminRequiredMiddleware, this.productController.deleteReview);

    // --- Discount Routes (Admin only) ---

    // POST /api/products/:name/discount (Admin only)
    this.router.post(`${this.path}/:name/discount`, adminRequiredMiddleware, this.productController.applyDiscount);

    // DELETE /api/products/:name/discount (Admin only)
    this.router.delete(`${this.path}/:name/discount`, adminRequiredMiddleware, this.productController.removeDiscount);
  }
} 