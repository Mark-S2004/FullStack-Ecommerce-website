// src/controllers/reviews.controller.ts

import { NextFunction, Request, Response } from 'express';
import * as reviewsService from '@services/reviews.service';
import { CreateReviewDto } from '@dtos/reviews.dto';

export const addReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.productId;
    const reviewData: CreateReviewDto = req.body;
    const userId = req.user._id;

    const updatedProduct = await reviewsService.addReview(productId, userId, reviewData);

    res.status(201).json({ data: updatedProduct, message: 'review added' });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.productId;
    const reviewId = req.params.reviewId;
    const reviewData: CreateReviewDto = req.body;

    const updatedProduct = await reviewsService.updateReview(productId, reviewId, reviewData);

    res.status(200).json({ data: updatedProduct, message: 'review updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.productId;
    const reviewId = req.params.reviewId;

    const updatedProduct = await reviewsService.deleteReview(productId, reviewId);

    res.status(200).json({ data: updatedProduct, message: 'review deleted' });
  } catch (error) {
    next(error);
  }
};
