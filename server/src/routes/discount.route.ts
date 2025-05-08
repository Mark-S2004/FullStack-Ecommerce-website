// server/src/routes/discount.route.ts
import { Router } from 'express';
import * as discountController from '@controllers/discount.controller';
import adminRequiredMiddleware from '@middlewares/adminRequired.middleware';
import validationMiddleware from '@middlewares/validation.middleware';
import { CreateDiscountDto, UpdateDiscountDto } from '@dtos/discounts.dto';

const path = '/discounts';
const router = Router();

// All discount routes are admin protected
router.use(path, adminRequiredMiddleware);

router.post(`${path}`, validationMiddleware(CreateDiscountDto, 'body'), discountController.createDiscountHandler);
router.get(`${path}`, discountController.getDiscountsHandler);
router.get(`${path}/:id`, discountController.getDiscountByIdHandler);
router.put(`${path}/:id`, validationMiddleware(UpdateDiscountDto, 'body', true), discountController.updateDiscountHandler);
router.delete(`${path}/:id`, discountController.deleteDiscountHandler);

export default { path, router }; 