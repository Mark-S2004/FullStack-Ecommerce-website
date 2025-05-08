// server/src/models/order.model.ts
import { model, Schema, Document, Types } from 'mongoose'; // Import Types and Document
// Correct import for Order and OrderItem interfaces
import { Order, OrderItem, ShippingAddress } from '@interfaces/orders.interface'; // Import Order, OrderItem, ShippingAddress
// Import Product interface for the populated type hint in OrderItem
import { Product } from '@interfaces/products.interface';


// Define the schema for OrderItem subdocuments
// Added type parameter for Schema
const OrderItemSchema = new Schema<OrderItem>({
  // Keep product as ObjectId reference
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, default: 1 }, // Changed from qty to quantity
  price: { type: Number, required: true, default: 0 },
  size: { type: String } // Added size field
}, { _id: true }); // Enable _id for subdocuments


// Defined ShippingAddressSchema
const ShippingAddressSchema = new Schema<ShippingAddress>({ // Add type parameter
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
}, { _id: false }); // Disable _id for subdocuments


// Define the main Order schema
const OrderSchema: Schema<Order> = new Schema({ // Add type parameter for Schema
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // Use the OrderItemSchema for the items array
  items: [OrderItemSchema],
  // Use the new ShippingAddressSchema
  shippingAddress: { type: ShippingAddressSchema, required: true },
  shippingCost: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  // Use the updated enum from the interface
  status: { type: String, default: 'Pending', enum: ['Pending', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] },
  createdAt: { type: Date, default: Date.now },
  orderNumber: { type: String, unique: true, sparse: true } // Added unique and sparse index
});

// Pre-save hook to generate order number (basic example)
OrderSchema.pre<Order & Document>('save', async function(next) { // Add type parameter for pre hook, include Document
  const order = this; // 'this' refers to the document being saved
  if (order.isNew) { // Use this.isNew property
    // Generate a simple order number (e.g., timestamp + last 4 digits of user ID)
    // A more robust approach might involve counters
    const timestamp = Date.now().toString().slice(-6); // Use last 6 digits for shorter number
    // Ensure user is treated as ObjectId before population (it should be at this stage)
    const userIdSuffix = (order.user as Types.ObjectId)?.toString().slice(-4) || '0000'; // Cast to ObjectId before toString, handle potential undefined
    order.orderNumber = `${timestamp}-${userIdSuffix}`;
  }
  next();
});


const OrderModel = model<Order>('Order', OrderSchema); // Simplified type parameter

export default OrderModel;