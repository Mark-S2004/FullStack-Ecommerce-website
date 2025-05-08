import { Router } from 'express';
import * as reviewController from '@controllers/review.controller';
import adminRequiredMiddleware from '@middlewares/adminRequired.middleware'; // Assuming you have this middleware

const path = '/reviews'; // Base path for admin review actions
const router = Router();

// Both routes require admin privileges
router.get(`/`, adminRequiredMiddleware, reviewController.getReviews); // GET /api/reviews (admin)
router.delete(`/:id`, adminRequiredMiddleware, reviewController.deleteReview); // DELETE /api/reviews/:id (admin)

export default { path, router }; 