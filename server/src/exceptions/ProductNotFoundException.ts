import { HttpException } from './HttpException';

export class ProductNotFoundException extends HttpException {
  constructor(productName: string) {
    super(404, `Product ${productName} not found`);
  }
} 