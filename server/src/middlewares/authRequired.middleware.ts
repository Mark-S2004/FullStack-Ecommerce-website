// server/src/middlewares/authRequired.middleware.ts
import { NextFunction, Response } from 'express';
import { HttpException } from '../exceptions/HttpException';
import { RequestWithUser } from '../interfaces/auth.interface';

// Middleware that enforces authentication is required for the route
const authRequiredMiddleware = (req: RequestWithUser, res: Response, next: NextFunction) => {
  // Check if req.user was attached by the preceding authMiddleware
  if (req.user) {
    next(); // User is authenticated, proceed to the next middleware/route handler
  } else {
    // No authenticated user found, send 401 Unauthorized
    next(new HttpException(401, 'Authentication required'));
  }
};

export default authRequiredMiddleware;