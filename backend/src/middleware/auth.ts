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
    console.log('DEBUG: authenticateToken called for', req.method, req.url);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('DEBUG: No token provided');
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
    res.status(403).json({
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