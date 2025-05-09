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
    // GET /products (Public, optional filter)
    this.router.get('/', this.productController.getProducts);

    // GET /products/meta/categories (Public)
    this.router.get('/meta/categories', this.productController.getProductCategories);

    // GET /products/id/:id (Public) - Get product by ID
    this.router.get('/id/:id', this.productController.getProductById);

    // GET /products/:name (Public)
    this.router.get('/:name', this.productController.getProductByName);

    // POST /products (Admin only)
    this.router.post(
      '/',
      adminRequiredMiddleware,
      validationMiddleware(CreateProductDto, 'body'),
      this.productController.createProduct,
    );

    // PUT /products/:name (Admin only)
    this.router.put(
      '/:name',
      adminRequiredMiddleware,
      validationMiddleware(CreateProductDto, 'body', true),
      this.productController.updateProduct,
    );

    // DELETE /products/:name (Admin only)
    this.router.delete('/:name', adminRequiredMiddleware, this.productController.deleteProduct);

    // --- Review Routes ---

    // POST /products/:name/reviews (Customer only)
    this.router.post('/:name/reviews', authRequiredMiddleware, this.productController.addReview);

    // POST /products/id/:id/reviews (Customer only) - Add review by product ID
    this.router.post('/id/:id/reviews', authRequiredMiddleware, this.productController.addReviewById);

    // DELETE /products/:name/reviews/:reviewId (Admin only)
    this.router.delete('/:name/reviews/:reviewId', adminRequiredMiddleware, this.productController.deleteReview);

    // --- Discount Routes (Admin only) ---

    // POST /products/:name/discount (Admin only)
    this.router.post('/:name/discount', adminRequiredMiddleware, this.productController.applyDiscount);

    // DELETE /products/:name/discount (Admin only)
    this.router.delete('/:name/discount', adminRequiredMiddleware, this.productController.removeDiscount);
  }
} 