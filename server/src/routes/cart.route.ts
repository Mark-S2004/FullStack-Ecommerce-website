// server/src/routes/cart.route.ts
import { Router } from 'express';
import * as cartController from '@controllers/cart.controller';
// Import the updated DTO
import { CreateCartItemDto } from '@dtos/cart.dto'; // Correct import path
// Import the clearCart controller function
import { clearCart } from '@controllers/cart.controller'; // Import clearCart specifically
import validationMiddleware from '@middlewares/validation.middleware';
// Import the necessary validators from class-validator
import { IsNumber, IsString, IsOptional } from 'class-validator'; // Added import

const path = '/cart';
const router = Router();

// Update Cart takes item ID in params and quantity/size in body
// Assuming body will be { quantity: number, size?: string }
// Correct the syntax in validationMiddleware - need to define a DTO class for the body
// Let's create a simple DTO for update
class UpdateCartItemBodyDto {
    @IsNumber()
    quantity: number;

    @IsString()
    @IsOptional() // Assuming size update is optional or null/undefined can clear it
    size?: string;
}
router.get(`${path}`, cartController.getCart);
router.post(`${path}`, validationMiddleware(CreateCartItemDto, 'body'), cartController.addToCart);

// Use the new DTO for validation
router.put(`${path}/:itemId`, validationMiddleware(UpdateCartItemBodyDto, 'body', true), cartController.updateCart); // Updated path and validation using DTO
router.delete(`${path}/:itemId`, cartController.removeFromCart); // Updated path to use itemId

// Add a route for clearing the entire cart
router.delete(`${path}`, clearCart); // Use the imported clearCart function


export default { path, router };