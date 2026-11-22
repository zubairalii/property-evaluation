import type { Response } from 'express';
import type { PageMeta } from '../types/domain';

export function sendSuccess<T>(
  res: Response,
  message: string,
  data: T,
  status = 200,
  meta?: PageMeta,
): void {
  res.status(status).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}
