import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors.js';

export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      console.warn(`[RBAC] Access denied for user ${req.user?.email || 'Unknown'}. User role: ${userRole}, Required roles: ${allowedRoles}`);
      throw new ForbiddenError('You do not have permission to perform this action');
    }
    
    next();
  };
};
