import { Request, Response, NextFunction } from 'express';
import Order, { IOrder } from '../models/orderModel';
import Product from '../models/productModel';
import Discount from '../models/discountModel';

// Create a new order
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountInfo,
      discountAmount,
      totalPrice,
    } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please login first',
      });
    }

    // Check stock availability for each item
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found with ID: ${item.product}`,
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }
    }

    // If there's a discount, increment its usage count
    if (discountInfo && discountInfo.discountId) {
      await Discount.findByIdAndUpdate(
        discountInfo.discountId,
        { $inc: { usedCount: 1 } }
      );
    }

    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountInfo,
      discountAmount,
      totalPrice,
      paidAt: Date.now(),
      user: req.user._id,
    });

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Calculate shipping and tax
export const calculateShippingAndTax = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderItems, shippingInfo } = req.body;

    if (!orderItems || !orderItems.length) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required',
      });
    }

    // Calculate items price
    let itemsPrice = 0;
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found with ID: ${item.product}`,
        });
      }
      
      // Check if product is in stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units available for ${product.name}`,
        });
      }
      
      itemsPrice += item.price * item.quantity;
    }

    // Calculate shipping cost based on destination and total weight
    // This is a simplified implementation - you could add more complex calculations
    let shippingPrice = 0;
    const baseShipping = 5.0; // Base shipping fee
    
    // Example: Add additional shipping based on country
    const country = shippingInfo.country;
    if (country !== 'USA') {
      shippingPrice = baseShipping + 10; // Higher shipping for international
    } else {
      shippingPrice = baseShipping;
    }

    // Calculate tax - for example, 7% sales tax
    const taxRate = 0.07;
    const taxPrice = itemsPrice * taxRate;

    // Calculate total
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    res.status(200).json({
      success: true,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    });
  } catch (error) {
    console.error('Calculate shipping error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate shipping and tax',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get single order details
export const getSingleOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found with this ID',
      });
    }

    // Check if the order belongs to the logged-in user or if user is admin
    if (req.user?.role !== 'admin' && order.user.toString() !== req.user?._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this order',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get logged in user orders
export const myOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please login first',
      });
    }

    const orders = await Order.find({ user: req.user._id });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get all orders -- Admin
export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.find();

    let totalAmount = 0;

    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });

    res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update order status -- Admin
export const updateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found with this ID',
      });
    }

    if (order.orderStatus === 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Order has already been delivered',
      });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide order status',
      });
    }

    order.orderStatus = status;

    // If order is delivered, set deliveredAt
    if (status === 'Delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Delete order -- Admin
export const deleteOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found with this ID',
      });
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}; 