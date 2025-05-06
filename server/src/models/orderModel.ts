import mongoose from 'mongoose';

interface ShippingInfo {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phoneNo: string;
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image: string;
  product: mongoose.Schema.Types.ObjectId;
}

interface PaymentInfo {
  id: string;
  status: string;
}

interface DiscountInfo {
  discountId: mongoose.Schema.Types.ObjectId;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
}

export interface IOrder extends mongoose.Document {
  shippingInfo: ShippingInfo;
  orderItems: OrderItem[];
  user: mongoose.Schema.Types.ObjectId;
  paymentInfo: PaymentInfo;
  paidAt: Date;
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  discountInfo?: DiscountInfo;
  discountAmount: number;
  totalPrice: number;
  orderStatus: string;
  deliveredAt?: Date;
  createdAt: Date;
}

const orderSchema = new mongoose.Schema<IOrder>({
  shippingInfo: {
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
  },
  orderItems: [
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  paymentInfo: {
    id: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  paidAt: {
    type: Date,
    required: true,
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  discountInfo: {
    discountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discount',
    },
    code: {
      type: String,
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
    },
    value: {
      type: Number,
    },
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  orderStatus: {
    type: String,
    required: true,
    default: 'Processing',
  },
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IOrder>('Order', orderSchema); 