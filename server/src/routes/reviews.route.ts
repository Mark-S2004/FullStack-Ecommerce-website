// src/routes/reviews.routes.ts

import { Router } from 'express';
import * as reviewsController from '@controllers/reviews.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { CreateReviewDto } from '@dtos/reviews.dto';

const path = '/products/:productId/reviews';
const router = Router();

router.post(path, validationMiddleware(CreateReviewDto, 'body'), reviewsController.addReview);
router.put(`${path}/:reviewId`, validationMiddleware(CreateReviewDto, 'body', true), reviewsController.updateReview);
router.delete(`${path}/:reviewId`, reviewsController.deleteReview);

export default { path, router };
