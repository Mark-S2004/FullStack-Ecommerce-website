import { OrderItem } from '../models/order.model';

/**
 * Calculate shipping cost based on country and items
 */
export function calcShipping(country: string, items: OrderItem[]): number {
  // Base shipping rate
  let baseCost = 5.99;
  
  // Add weight-based costs (simplified)
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
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