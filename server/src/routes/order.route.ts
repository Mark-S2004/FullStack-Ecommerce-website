import { Router } from 'express';
import * as orderController from '@controllers/order.controller';
// Import the ShippingAddress interface
import { ShippingAddress } from '@interfaces/orders.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import { IsString, IsEmail, IsOptional, IsObject } from 'class-validator'; // Import necessary validators

const path = '/orders';
const router = Router();

// Define a DTO for the shippingAddress object sent in the body
class ShippingAddressDto implements ShippingAddress {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string; // Basic validation, can add pattern for stricter format

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  postalCode: string;

  @IsString()
  country: string;
}

// Define the main DTO for the create order body
class CreateOrderBodyDto {
    @IsObject()
    @IsOptional() // Optional if you handle cases where user might reuse a saved address
    // Validate the nested shippingAddress object using the DTO
    shippingAddress?: ShippingAddressDto; // Make optional for flexibility, service should handle missing/invalid

    // Add other fields if needed in the order creation request body
}


router.get(`${path}`, orderController.getOrders);
// Changed route path to match client
router.get(`${path}/my-orders`, orderController.getOrdersByCustomer); // Changed path

// Use the new DTO for validation of the request body
router.post(`${path}`, validationMiddleware(CreateOrderBodyDto, 'body'), orderController.createOrder);

router.put(`${path}/:id/status`, orderController.updateOrderStatus);

export default { path, router };