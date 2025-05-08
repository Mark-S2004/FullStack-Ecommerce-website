import { NextFunction, Request, Response } from 'express';
import { Review } from '@interfaces/reviews.interface';
import * as reviewService from '@services/review.service';

export const getReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const findAllReviewsData: Review[] = await reviewService.findAllReviews();
    res.status(200).json({ data: findAllReviewsData, message: 'findAll' });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reviewId: string = req.params.id;
    const deleteReviewData: Review = await reviewService.deleteReviewById(reviewId);
    res.status(200).json({ data: deleteReviewData, message: 'deleted' });
  } catch (error) {
    next(error);
  }
}; 