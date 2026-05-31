import { NextFunction, Request, Response } from 'express';
import { ObjectSchema } from 'joi';
import { AppError } from '../utils/errors';

export function validateBody(schema: ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return next(new AppError(error.details.map(item => item.message).join(', '), 422, 'VALIDATION_ERROR'));
    }
    req.body = value;
    return next();
  };
}
