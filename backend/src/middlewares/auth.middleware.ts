import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

export const restrictTo = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    // req.user.role ay dapat galing sa iyong 'protect' middleware
    if (!roles.includes(req.user.role)) {
      throw new AppError("You do not have permission to perform this action", 403);
    }
    next();
  };
};

export interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  // 1. Check kung may token sa Headers (Authorization: Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // Kunin yung string pagkatapos ng "Bearer"

      // 2. I-verify ang token gamit ang ating SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey') as { id: number; 
        email: string };

      // 3. I-attach ang user data sa request para magamit sa susunod na function
      req.user = decoded;

      next(); // Tuloy ang ligaya sa controller!
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};