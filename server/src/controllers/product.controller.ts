import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { Product } from '@interfaces/products.interface';
import ProductService from '@services/product.service';
import { User } from '@interfaces/users.interface';
import { HttpException } from '@exceptions/HttpException';

// Extend Express Request type to include optional user property
declare global {
  namespace Express {
    interface Request {
      user?: User; // Make user optional as it comes from non-blocking middleware first
    }
  }
}

export class ProductController {
  public productService = Container.get(ProductService);

  public getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = req.query.category as string; // Get category from query param
      const findAllProductsData: Product[] = await this.productService.findAllProduct(category); // Pass category to service

      res.status(200).json({ data: findAllProductsData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getProductByName = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productName: string = req.params.name;
      const findOneProductData: Product = await this.productService.findProductByName(productName);

      res.status(200).json({ data: findOneProductData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productData: Product = req.body;
      const createProductData: Product = await this.productService.createProduct(productData);

      res.status(201).json({ data: createProductData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productName: string = req.params.name;
      const productData: Product = req.body;
      const updateProductData: Product = await this.productService.updateProduct(productName, productData);

      res.status(200).json({ data: updateProductData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  public deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productName: string = req.params.name;
      const deleteProductData: Product = await this.productService.deleteProduct(productName);

      res.status(200).json({ data: deleteProductData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  // --- Review Controller Methods ---
  public addReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productName: string = req.params.name;
      const userId = req.user?._id; // Get user ID from authenticated user
      const reviewData = req.body; // { rating, comment }

      if (!userId) {
        return next(new HttpException(401, 'Authentication required to add review'));
      }

      const updatedProduct: Product = await this.productService.addReview(productName, userId, reviewData);

      res.status(201).json({ data: updatedProduct, message: 'reviewAdded' });
    } catch (error) {
      next(error);
    }
  };

  public deleteReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productName: string = req.params.name;
      const reviewId: string = req.params.reviewId; // Get reviewId from route params

      // Note: Authorization (isAdmin) should be handled by middleware on the route
      const updatedProduct: Product = await this.productService.deleteReview(productName, reviewId);

      res.status(200).json({ data: updatedProduct, message: 'reviewDeleted' });
    } catch (error) {
      next(error);
    }
  };

  // --- Discount Controller Methods (Admin only) ---
  public applyDiscount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productName: string = req.params.name;
      const { discountPercentage } = req.body; // Expect { discountPercentage: number }

      if (typeof discountPercentage !== 'number') {
        return next(new HttpException(400, 'discountPercentage is required and must be a number'));
      }

      const updatedProduct: Product = await this.productService.applyDiscount(productName, discountPercentage);
      res.status(200).json({ data: updatedProduct, message: 'discountApplied' });
    } catch (error) {
      next(error);
    }
  };

  public removeDiscount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productName: string = req.params.name;
      const updatedProduct: Product = await this.productService.removeDiscount(productName);
      res.status(200).json({ data: updatedProduct, message: 'discountRemoved' });
    } catch (error) {
      next(error);
    }
  };
} 