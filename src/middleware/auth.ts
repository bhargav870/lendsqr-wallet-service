import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';

  if (!token || token !== env.apiToken) {
    return next(new AppError('Unauthorized request', 401, 'UNAUTHORIZED'));
  }

  return next();
}
