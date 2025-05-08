import { NextFunction, Request, Response } from 'express';
import { CreateProductDto } from '../dtos/products.dto';
import { Product } from '../interfaces/products.interface';
import * as productService from '../services/products.service';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const findAllProductsData: Product[] = await productService.findAllProduct();

    res.status(200).json({ data: findAllProductsData, message: 'findAll' });
  } catch (error) {
    next(error);
  }
};

export const getProductByName = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ProductName: string = req.params.name;
    const findOneProductData: Product = await productService.findProductByName(ProductName);

    res.status(200).json({ data: findOneProductData, message: 'findOne' });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ProductData: CreateProductDto = req.body;
    const createProductData: Product = await productService.createProduct(ProductData);

    res.status(201).json({ data: createProductData, message: 'created' });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ProductName: string = req.params.name;
    const ProductData: CreateProductDto = req.body;
    const updateProductData: Product = await productService.updateProduct(ProductName, ProductData);

    res.status(200).json({ data: updateProductData, message: 'updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ProductName: string = req.params.name;
    const deleteProductData: Product = await productService.deleteProduct(ProductName);

    res.status(200).json({ data: deleteProductData, message: 'deleted' });
  } catch (error) {
    next(error);
  }
};
