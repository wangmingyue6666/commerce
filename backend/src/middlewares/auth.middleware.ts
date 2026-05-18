import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: number;
  username: string;
  role: 'admin' | 'user';
  email: string;
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ success: false, message: '需要身份验证' });
    return;
  }

  const secret = process.env.JWT_SECRET || 'ecommerce_secret_key_2026';
  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    (req as Request & { user?: JwtPayload }).user = payload;
    next();
  } catch (_error) {
    res.status(403).json({ success: false, message: '令牌无效或已过期' });
  }
}
