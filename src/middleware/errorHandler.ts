import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const timestamp = new Date().toISOString();
  const path = req.originalUrl;

  res.status(status).json({
    error: message,
    status,
    timestamp,
    path
  });
};
