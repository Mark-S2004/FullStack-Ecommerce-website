import { NextFunction, Request, Response } from 'express';
import * as discountService from '@services/discount.service';
import { CreateDiscountDto, UpdateDiscountDto } from '@dtos/discounts.dto';
import { Discount } from '@interfaces/discounts.interface';

export const createDiscountHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const discountData: CreateDiscountDto = req.body;
    const newDiscount: Discount = await discountService.createDiscount(discountData);
    res.status(201).json({ data: newDiscount, message: 'created' });
  } catch (error) {
    next(error);
  }
};

export const getDiscountsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const findAllDiscountsData: Discount[] = await discountService.findAllDiscounts(req.query);
    res.status(200).json({ data: findAllDiscountsData, message: 'findAll' });
  } catch (error) {
    next(error);
  }
};

export const getDiscountByIdHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const discountId: string = req.params.id;
    const findOneDiscountData: Discount = await discountService.findDiscountById(discountId);
    res.status(200).json({ data: findOneDiscountData, message: 'findOne' });
  } catch (error) {
    next(error);
  }
};

export const updateDiscountHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const discountId: string = req.params.id;
    const discountData: UpdateDiscountDto = req.body;
    const updatedDiscount: Discount = await discountService.updateDiscount(discountId, discountData);
    res.status(200).json({ data: updatedDiscount, message: 'updated' });
  } catch (error) {
    next(error);
  }
};

export const deleteDiscountHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const discountId: string = req.params.id;
    const deletedDiscount: Discount = await discountService.deleteDiscount(discountId);
    res.status(200).json({ data: deletedDiscount, message: 'deleted' });
  } catch (error) {
    next(error);
  }
}; 