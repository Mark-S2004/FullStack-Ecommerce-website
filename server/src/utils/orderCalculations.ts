import { OrderItem } from '@interfaces/orders.interface'; // Adjusted import path assuming standard alias

/**
 * Calculate shipping cost based on shipping address.
 * - Cairo: 50
 * - Alexandria: 100
 * - Default: 75 (if not Cairo or Alexandria)
 */
export function calcShipping(shippingAddress: string): number {
  const addressLower = shippingAddress.toLowerCase();
  
  if (addressLower.includes('cairo')) {
    return 50;
  }
  if (addressLower.includes('alexandria')) {
    return 100;
  }
  // Default shipping cost if neither Cairo nor Alexandria is found
  return 75; 
}

/**
 * Calculate tax based on subtotal (14% VAT).
 */
export function calcTax(subtotal: number): number {
  const taxRate = 0.14; // 14% VAT
  return subtotal * taxRate;
} 