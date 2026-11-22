import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { HttpError } from '../utils/http-error';

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      next(new HttpError(400, 'Validation failed', parsed.error.flatten()));
      return;
    }
    req.body = parsed.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      next(new HttpError(400, 'Validation failed', parsed.error.flatten()));
      return;
    }
    req.validatedQuery = parsed.data;
    next();
  };
}

export function getValidatedQuery<T>(req: Request): T {
  return req.validatedQuery as T;
}
