import { model, Schema, Document, Types } from 'mongoose';
// Correct import for Order and OrderItem interfaces
import { Order, OrderItem, ShippingAddress } from '@interfaces/orders.interface'; // Import Order, OrderItem, ShippingAddress

const OrderItemSchema = new Schema({
  // Keep product as ObjectId reference
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true }, // Changed from qty to quantity
  price: { type: Number, required: true },
  size: { type: String } // Added size field
}, { _id: true }); // Enable _id for subdocuments if needed for updates/removals


// Defined ShippingAddressSchema
const ShippingAddressSchema = new Schema({
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


const OrderSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  // Use the new ShippingAddressSchema
  shippingAddress: { type: ShippingAddressSchema, required: true },
  shippingCost: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] }, // Added Processing and Confirmed to enum
  createdAt: { type: Date, default: Date.now },
  orderNumber: { type: String, unique: true, sparse: true } // Added unique and sparse index
});

// Pre-save hook to generate order number (basic example)
OrderSchema.pre('save', async function(next) {
  const order = this as any; // Type assertion
  if (order.isNew) {
    // Generate a simple order number (e.g., timestamp + last 4 digits of user ID)
    // A more robust approach might involve counters
    const timestamp = Date.now().toString();
    const userIdSuffix = order.user.toString().slice(-4);
    order.orderNumber = `${timestamp}-${userIdSuffix}`;
  }
  next();
});


const OrderModel = model<Order & Document>('Order', OrderSchema);

export default OrderModel;