import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: number;
  username: string;
  role: 'admin' | 'user';
  email: string;
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  console.log('=== 认证中间件 ===');
  console.log('请求路径:', req.path);
  console.log('请求方法:', req.method);
  
  const authHeader = req.headers.authorization;
  console.log('Authorization头:', authHeader ? '存在' : '不存在');
  
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    console.log('认证失败: 未提供令牌');
    res.status(401).json({ success: false, message: '需要身份验证' });
    return;
  }

  const secret = process.env.JWT_SECRET || 'ecommerce_secret_key_2026';
  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    console.log('认证成功，用户ID:', payload.id);
    (req as Request & { user?: JwtPayload }).user = payload;
    next();
  } catch (_error) {
    console.log('认证失败: 令牌无效或已过期');
    res.status(403).json({ success: false, message: '令牌无效或已过期' });
  }
}
