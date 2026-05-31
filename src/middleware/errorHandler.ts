import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors';

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const appError = err instanceof AppError ? err : new AppError('Internal server error', 500, 'INTERNAL_ERROR');

  res.status(appError.statusCode).json({
    status: 'error',
    message: appError.message,
    code: appError.code
  });
}
