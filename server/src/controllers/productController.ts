import { Request, Response, NextFunction } from 'express';
import Product, { IProduct } from '../models/productModel';
import mongoose from 'mongoose';

// Get all products
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get single product details
export const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Create new product -- Admin
export const createProduct = async (
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

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Update product -- Admin
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Delete product -- Admin
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Create/Update product review
export const createProductReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { rating, comment, productId } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please login first',
      });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
      status: 'pending', // Default status is pending for moderation
      createdAt: new Date()
    };

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if user already reviewed this product
    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user?._id.toString()
    );

    if (isReviewed) {
      // Update existing review
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user?._id.toString()) {
          rev.rating = rating;
          rev.comment = comment;
          rev.status = 'pending'; // Reset status to pending when updated
          rev.createdAt = new Date();
        }
      });
    } else {
      // Add new review
      const newReview = {
        _id: new mongoose.Types.ObjectId(),
        user: review.user,
        name: review.name,
        rating: review.rating,
        comment: review.comment,
        status: review.status as 'pending' | 'approved' | 'rejected',
        createdAt: review.createdAt
      };
      product.reviews.push(newReview);
      product.numOfReviews = product.reviews.length;
    }

    // Update overall rating - only count approved reviews
    const approvedReviews = product.reviews.filter(rev => rev.status === 'approved');
    if (approvedReviews.length > 0) {
      product.rating =
        approvedReviews.reduce((acc, item) => item.rating + acc, 0) /
        approvedReviews.length;
    } else {
      product.rating = 0;
    }

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get all reviews of a product
export const getProductReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.query.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // For regular users, only return approved reviews
    if (req.user?.role !== 'admin') {
      const approvedReviews = product.reviews.filter(rev => rev.status === 'approved');
      return res.status(200).json({
        success: true,
        reviews: approvedReviews,
      });
    }

    // For admins, return all reviews
    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Delete review
export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await Product.findById(req.query.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Filter out the review to be deleted
    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id?.toString()
    );

    // Update product with new reviews
    const numOfReviews = reviews.length;

    // Calculate new rating - only count approved reviews
    const approvedReviews = reviews.filter(rev => rev.status === 'approved');
    const rating =
      approvedReviews.length === 0
        ? 0
        : approvedReviews.reduce((acc, item) => item.rating + acc, 0) / approvedReviews.length;

    await Product.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        rating,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Moderate review (approve or reject) -- Admin
export const moderateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId, reviewId, status } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }
    
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    
    // Find and update review status
    const reviewExists = product.reviews.find(
      (rev) => rev._id.toString() === reviewId
    );
    
    if (!reviewExists) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }
    
    // Update review status
    product.reviews.forEach((rev) => {
      if (rev._id.toString() === reviewId) {
        rev.status = status;
      }
    });
    
    // Update overall rating - only count approved reviews
    const approvedReviews = product.reviews.filter(rev => rev.status === 'approved');
    if (approvedReviews.length > 0) {
      product.rating =
        approvedReviews.reduce((acc, item) => item.rating + acc, 0) /
        approvedReviews.length;
    } else {
      product.rating = 0;
    }
    
    await product.save();
    
    res.status(200).json({
      success: true,
      message: `Review ${status} successfully`,
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Get all products with reviews for moderation -- Admin
export const getProductsWithReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Find all products that have at least one review
    const products = await Product.find({ 'reviews.0': { $exists: true } });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error('Get products with reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products with reviews',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}; 