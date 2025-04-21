import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import AppError from '../utils/appError';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError(errors.array()[0].msg, 400));
  }
  next();
};