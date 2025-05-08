import { NextFunction, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { RequestWithUser } from '@interfaces/auth.interface'; // Ensure this interface has user.role

const adminRequiredMiddleware = (req: RequestWithUser, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(new HttpException(403, 'Forbidden: Admin access required'));
  }
};

export default adminRequiredMiddleware; 