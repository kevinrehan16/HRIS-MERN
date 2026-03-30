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
  user?: { id: number; email: string; role: string };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1. Priority: Tumingin sa HttpOnly Cookies
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } 
  // 2. Fallback: Tumingin sa Headers (Para sa Insomnia/Postman testing)
  else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 3. Check kung may nakuha ba talagang token
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized, no token found' 
    });
  }

  try {
    // 4. I-verify ang token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'supersecretkey'
    ) as { id: number; email: string; role: string };

    // 5. I-attach ang decoded user data sa request object
    req.user = decoded;

    next(); // Proceed sa next function/controller
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized, token expired or invalid' 
    });
  }
};