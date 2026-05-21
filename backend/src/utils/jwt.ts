import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface JwtPayload {
  userId: number;
  username: string;
  role?: string;
}

export class JwtService {
  private static readonly SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
  private static readonly EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

  /**
   * 生成JWT令牌
   */
  static generateToken(payload: JwtPayload): string {
    const options: SignOptions = {
      expiresIn: this.EXPIRES_IN as SignOptions['expiresIn']
    };
    return jwt.sign(payload, this.SECRET as string, options);
  }

  /**
   * 验证JWT令牌
   */
  static verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.SECRET) as JwtPayload;
    } catch (error) {
      throw new Error('无效的令牌');
    }
  }

  /**
   * 从请求头中提取令牌
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1];
    }

    return null;
  }

  /**
   * 解码令牌（不验证）
   */
  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch {
      return null;
    }
  }

  /**
   * 刷新令牌
   */
  static refreshToken(oldToken: string): string {
    const payload = this.verifyToken(oldToken);
    return this.generateToken(payload);
  }

  /**
   * 检查令牌是否即将过期
   */
  static isTokenExpiringSoon(token: string, thresholdHours: number = 24): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return false;
      }

      const expTimestamp = decoded.exp * 1000; // 转换为毫秒
      const now = Date.now();
      const thresholdMs = thresholdHours * 60 * 60 * 1000;

      return expTimestamp - now <= thresholdMs;
    } catch {
      return false;
    }
  }
}

export default JwtService;