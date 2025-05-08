// src/utils/orderCalculations.ts
// Correct import for OrderItem structure (assuming it's used here for calculation logic)
// Note: This util currently expects the DB schema structure for items (with qty)
// If calcShipping needs populated product data, the service calling it needs to pass that.
// Based on cart.service.ts, it passes `mappedCartItems` which uses 'quantity', not 'qty'.
// Let's update calcShipping to accept items with 'quantity' to match its usage in cart.service.ts
// import { OrderItem as BackendOrderItem } from '../models/order.model'; // Removed unused import

// Define the interface for items expected by calcShipping
interface ItemForCalculation {
  quantity: number; // Expect quantity field
  // Add other fields needed for calculation, e.g., product details like weight if necessary
  // For now, just quantity is used for weight calculation
}


/**
* Calculate shipping cost based on country and items
* Items here should have a 'quantity' field
*/
// Update type annotation for items parameter
export function calcShipping(country: string, items: ItemForCalculation[]): number {
 // Base shipping rate
 let baseCost = 5.99;

 // Add weight-based costs (simplified) - using quantity as a proxy for weight
 const totalQty = items.reduce((sum, item) => sum + item.quantity, 0); // Use item.quantity
 const weightCost = totalQty * 0.5; // $0.5 per item

 // Add country-specific costs
 if (country === 'US') {
   // Domestic shipping
   baseCost = 4.99;
 } else if (['CA', 'MX'].includes(country)) {
   // North America
   baseCost = 9.99;
 } else {
   // International
   baseCost = 14.99;
 }

 return baseCost + weightCost;
}

/**
* Calculate tax based on subtotal
*/
export function calcTax(subtotal: number): number {
 // Simple flat tax rate of 8.5%
 const taxRate = 0.085;
 return subtotal * taxRate;
}