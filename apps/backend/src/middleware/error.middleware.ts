import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/logger';
import { HttpError } from '../utils/http-error';

export function notFoundMiddleware(_req: Request, res: Response): void {
  res.status(404).json({ success: false, message: 'Route not found', data: null });
}

export function errorMiddleware(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    if (err.status >= 500) logger.error({ err, path: req.path }, err.message);
    res.status(err.status).json({
      success: false,
      message: err.message,
      data: null,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      data: null,
      details: err.flatten(),
    });
    return;
  }

  logger.error({ err, path: req.path }, 'unhandled error');
  res.status(500).json({ success: false, message: 'Internal server error', data: null });
}
