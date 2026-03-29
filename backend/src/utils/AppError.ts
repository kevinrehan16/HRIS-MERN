export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Ito ay para malaman kung "expected" error ito o system crash

    Error.captureStackTrace(this, this.constructor);
  }
}