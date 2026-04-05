import { UserResponse } from '../index.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'VIEWER' | 'ANALYST' | 'ADMIN';
      };
    }
  }
}
