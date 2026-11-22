import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/http-error';

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'admin' || req.user.profile.status !== 'active') {
    next(new HttpError(403, 'Administrator access is required'));
    return;
  }
  next();
}
