import { Request, Response, NextFunction } from 'express';
import Discount, { IDiscount } from '../models/discountModel';
import Product from '../models/productModel';

// Create a new discount code -- Admin
export const createDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const discount = await Discount.create(req.body);

    res.status(201).json({
      success: true,
      discount,
    });
  } catch (error) {
    console.error('Create discount error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create discount',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get all discounts -- Admin
export const getAllDiscounts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const discounts = await Discount.find();

    res.status(200).json({
      success: true,
      count: discounts.length,
      discounts,
    });
  } catch (error) {
    console.error('Get discounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discounts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get single discount -- Admin
export const getDiscountDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const discount = await Discount.findById(req.params.id);

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found',
      });
    }

    res.status(200).json({
      success: true,
      discount,
    });
  } catch (error) {
    console.error('Get discount error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch discount',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update discount -- Admin
export const updateDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let discount = await Discount.findById(req.params.id);

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found',
      });
    }

    discount = await Discount.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      discount,
    });
  } catch (error) {
    console.error('Update discount error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update discount',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Delete discount -- Admin
export const deleteDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const discount = await Discount.findById(req.params.id);

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found',
      });
    }

    await discount.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Discount deleted successfully',
    });
  } catch (error) {
    console.error('Delete discount error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete discount',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Validate discount code
export const validateDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, cartTotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a discount code',
      });
    }

    // Find the discount code (case insensitive)
    const discount = await Discount.findOne({
      code: { $regex: new RegExp('^' + code + '$', 'i') },
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Invalid discount code',
      });
    }

    // Check if discount is active
    if (!discount.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This discount code is not active',
      });
    }

    // Check expiration
    const now = new Date();
    if (now < discount.validFrom || now > discount.validUntil) {
      return res.status(400).json({
        success: false,
        message: 'This discount code has expired or is not yet valid',
      });
    }

    // Check usage limit
    if (discount.maxUses > 0 && discount.usedCount >= discount.maxUses) {
      return res.status(400).json({
        success: false,
        message: 'This discount code has reached its usage limit',
      });
    }

    // Check minimum purchase amount
    if (cartTotal < discount.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase amount of $${discount.minPurchase} required for this discount`,
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.discountType === 'percentage') {
      discountAmount = (cartTotal * discount.value) / 100;
    } else {
      discountAmount = discount.value;
    }

    res.status(200).json({
      success: true,
      discount: {
        _id: discount._id,
        code: discount.code,
        discountType: discount.discountType,
        value: discount.value,
        discountAmount,
      },
    });
  } catch (error) {
    console.error('Validate discount error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate discount',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Apply discount to specific product IDs -- Advanced feature
export const applyDiscountToProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { discountId, productIds } = req.body;

    const discount = await Discount.findById(discountId);

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found',
      });
    }

    // Validate product IDs
    for (const productId of productIds) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${productId} not found`,
        });
      }
    }

    // Update discount with applicable products
    discount.applicableProducts = productIds;
    await discount.save();

    res.status(200).json({
      success: true,
      message: 'Discount applied to products successfully',
      discount,
    });
  } catch (error) {
    console.error('Apply discount to products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to apply discount to products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}; 