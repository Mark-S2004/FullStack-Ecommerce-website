// server/src/routes/reviews.route.ts
import { Router } from 'express';
import * as reviewsController from '../controllers/reviews.controller';
import validationMiddleware from '../middlewares/validation.middleware';
import { CreateReviewDto } from '../dtos/reviews.dto';

// This path includes a parameter, it defines WHERE this router will be mounted
const path = '/products/:productId/reviews';
const router = Router({ mergeParams: true }); // Merge params from parent router

// Define routes relative to the base path (which includes :productId)
// These will hit authRequiredMiddleware in app.ts if needsAuth is true for this route
router.post('/', validationMiddleware(CreateReviewDto, 'body'), reviewsController.addReview); // Full path: /api/products/:productId/reviews
router.put('/:reviewId', validationMiddleware(CreateReviewDto, 'body', true), reviewsController.updateReview); // Full path: /api/products/:productId/reviews/:reviewId
router.delete('/:reviewId', reviewsController.deleteReview); // Full path: /api/products/:productId/reviews/:reviewId

export default { path, router };