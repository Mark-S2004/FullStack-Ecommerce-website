import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';

export class AdminController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  async getDashboardData(req: Request, res: Response): Promise<void> {
    try {
      const totalProducts = await this.productService.countProducts();
      res.status(200).json({
        data: {
          totalProducts,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
  }

  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query;
      const products = await this.productService.getAllProducts(filters);
      res.status(200).json({ data: products });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const productData = req.body;
      const newProduct = await this.productService.createProduct(productData);
      res.status(201).json({ data: newProduct });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create product' });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const productId = req.params.id;
      const updateData = req.body;
      const updatedProduct = await this.productService.updateProduct(productId, updateData);
      if (!updatedProduct) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.status(200).json({ data: updatedProduct });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update product' });
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const productId = req.params.id;
      const deletedProduct = await this.productService.deleteProduct(productId);
      if (!deletedProduct) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.status(200).json({ data: deletedProduct });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  }
} 