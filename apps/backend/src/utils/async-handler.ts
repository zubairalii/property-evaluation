import type { NextFunction, Request, Response } from 'express';

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return handler(req, res, next).catch((error: unknown) => {
      next(error);
    });
  };
}
