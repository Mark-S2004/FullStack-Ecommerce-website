export interface OrderItem {
  product: string;
  qty: number;
  price: number;
}

// export interface ShippingAddress {
//   line1: string;
//   city: string;
//   country: string;
//   postalCode: string;
// }

export interface Order {
  user: string;
  items: OrderItem[];
  shippingAddress: string;
  shippingCost: number;
  tax: number;
  total: number;
  status: string;
  createdAt: Date;
}
