// server/src/middlewares/auth.middleware.ts
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import userModel from '@models/users.model';

// This middleware attempts to authenticate the user if a token is present.
// It attaches req.user if successful, but always calls next() regardless of status.
const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);

    if (Authorization) {
      const secretKey: string = SECRET_KEY;
      // Use async/await with the verify function
      const verificationResponse = await new Promise<DataStoredInToken>((resolve, reject) => {
          verify(Authorization, secretKey, (err, decoded) => {
              if (err) reject(err);
              else resolve(decoded as DataStoredInToken);
          });
      });

      const userId = verificationResponse._id;
      // Find the user by ID
      const findUser = await userModel.findById(userId);

      if (findUser) {
        req.user = findUser; // Attach the found user to the request object
      }
    }
    // ALWAYS call next() to allow the request to continue down the middleware stack
    next();

  } catch (error) {
    // If token verification fails (e.g., invalid signature, expired),
    // log the error but still call next().
    // Subsequent middlewares (like authRequiredMiddleware) will handle the unauthorized state.
    console.error('Auth middleware token verification failed:', error.message);
    next();
  }
};

export default authMiddleware;