import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof Error) {
    logger.error('Unhandled error', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
  } else {
    logger.error('Unhandled error', {
      message: 'Unknown server error',
      error: err
    });
  }
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
}
