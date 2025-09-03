import { Request, Response, NextFunction } from 'express';

/**
 * Centralized error handling middleware.
 *
 * When an error is passed to next(), this middleware logs the error
 * and sends an appropriate JSON response to the client.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Server error';
  res.status(status).json({ message });
};