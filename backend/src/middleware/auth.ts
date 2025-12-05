import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { JwtPayload } from '../types/auth';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name?: string;
        role?: string;
        passwordResetRequired?: boolean;
      };
    }
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: { message: 'Access token required' }
      });
      return;
    }

    const decoded = AuthService.verifyToken(token) as JwtPayload;
    const user = await AuthService.getUserById(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: 'User not found' }
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired token' }
    });
    return;
  }
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = AuthService.verifyToken(token) as JwtPayload;
      const user = await AuthService.getUserById(decoded.userId);
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: { message: 'Authentication required' }
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: { message: 'Admin access required' }
    });
    return;
  }

  next();
};

/**
 * Middleware to check if password reset is required
 */
export const checkPasswordResetRequired = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: { message: 'Authentication required' }
    });
    return;
  }

  if (req.user.passwordResetRequired) {
    res.status(403).json({
      success: false,
      error: {
        message: 'Password reset required',
        passwordResetRequired: true
      }
    });
    return;
  }

  next();
};