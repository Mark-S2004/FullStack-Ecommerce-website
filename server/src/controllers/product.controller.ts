import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';

export class ProductController {
  static async create(req: Request, res: Response) {
    const product = await ProductService.create(req.body);
    res.status(201).json(product);
  }

  static async list(req: Request, res: Response) {
    const filter: any = {};
    
    // Add search filter if provided in query params
    if (req.query.search) {
      filter.search = req.query.search as string;
    }
    
    const products = await ProductService.list(filter);
    res.json(products);
  }

  static async getById(req: Request, res: Response) {
    const product = await ProductService.getById(req.params.id);
    res.json(product);
  }

  static async update(req: Request, res: Response) {
    const product = await ProductService.update(req.params.id, req.body);
    res.json(product);
  }

  static async remove(req: Request, res: Response) {
    await ProductService.remove(req.params.id);
    res.status(204).send();
  }
}
