import type { Role } from '../data/store';

declare global {
  namespace Express {
    interface UserInfo {
      id: number;
      username: string;
      role: Role;
      email: string;
    }

    interface Request {
      user?: UserInfo;
    }
  }
}

export {};
