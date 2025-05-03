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
    
    // Pass category and gender filters
    if (req.query.category) {
      filter.category = req.query.category as string;
    }
    if (req.query.gender) {
      filter.gender = req.query.gender as string;
    }
    
    const products = await ProductService.list(filter);
    // Wrap response in a data object as expected by frontend
    res.json({ data: products });
  }

  static async getById(req: Request, res: Response) {
    const product = await ProductService.getById(req.params.id);
    // Wrap response in a data object
    res.json({ data: product });
  }

  static async update(req: Request, res: Response) {
    const product = await ProductService.update(req.params.id, req.body);
    // Wrap response in a data object
    res.json({ data: product });
  }

  static async remove(req: Request, res: Response) {
    await ProductService.remove(req.params.id);
    res.status(204).send();
  }
}
