import { model, Schema, Document } from 'mongoose';
import { Order } from '@interfaces/orders.interface';

const OrderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
});

// const ShippingAddressSchema = new Schema({
//   line1: { type: String, required: true },
//   city: { type: String, required: true },
//   country: { type: String, required: true },
//   postalCode: { type: String, required: true },
// });

const OrderSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [OrderItemSchema],
  shippingAddress: { type: String, required: true },
  stripeSessionId: { type: String },
  stripePaymentIntentId: { type: String },
  subtotal: { type: Number, required: true },
  discountCode: { type: String, trim: true },
  discountAmount: { type: Number, default: 0 },
  totalAfterDiscount: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Payment Failed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending', index: true },
  createdAt: { type: Date, default: Date.now },
});

const OrderModel = model<Order & Document>('Order', OrderSchema);

export default OrderModel;
