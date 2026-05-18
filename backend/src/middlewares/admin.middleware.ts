import type { NextFunction, Request, Response } from 'express';

export function adminMiddleware(req: Request, res: Response, next: NextFunction): void {
  const user = (req as any).user;
  
  if (!user) {
    res.status(401).json({ success: false, message: '需要身份验证' });
    return;
  }

  if (user.username !== 'admin') {
    res.status(403).json({ success: false, message: '需要管理员权限' });
    return;
  }

  next();
}