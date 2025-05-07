import { Router } from 'express';
    // Import your admin products controller functions
    import * as productsController from '@controllers/products.controller'; // Re-use existing product controller for list/delete

    const router = Router();
    const path = '/admin/products';

    router.get(`${path}`, productsController.getProducts); // Re-use getProducts, add admin auth middleware separately
    router.delete(`${path}/:id`, productsController.deleteProduct); // Re-use deleteProduct

    // Add routes for create/update if implemented
    // router.post(`${path}`, validationMiddleware(CreateProductDto), productsController.createProduct);
    // router.put(`${path}/:id`, validationMiddleware(CreateProductDto), productsController.updateProduct);


    export default { path, router };