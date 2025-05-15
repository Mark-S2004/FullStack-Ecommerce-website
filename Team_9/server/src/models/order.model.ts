import { model, Schema, Document } from 'mongoose';
import { Order } from '@interfaces/orders.interface';

const OrderItemSchema = new Schema({
  product: { type: String, required: true },
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
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  shippingAddress: { type: String, required: true },
  shippingCost: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] },
  createdAt: { type: Date, default: Date.now },
});

const OrderModel = model<Order & Document>('Order', OrderSchema);

export default OrderModel;
