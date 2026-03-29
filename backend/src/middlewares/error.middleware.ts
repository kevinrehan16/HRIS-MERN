import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError.js';

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // 1. Handle Prisma Errors (Database Level)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string) || 'field';
      statusCode = 400;
      message = `The ${target.split('_')[1] || 'input'} you provided is already registered.`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'The requested record was not found.';
    }
  }

  // 2. Handle JWT Errors (Auth Level)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please login again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please login again.';
  }

  // 3. Environment-Based Response (Enterprise Standard)
  if (process.env.NODE_ENV === 'development') {
    // Sa Dev, pakita lahat pati stack trace para madali mag-debug
    res.status(statusCode).json({
      success: false,
      message,
      stack: err.stack,
      error: err,
    });
  } else {
    // Sa Production, malinis lang dapat (No stack traces!)
    res.status(statusCode).json({
      success: false,
      message: err.isOperational ? message : 'Something went very wrong!',
    });
  }
};