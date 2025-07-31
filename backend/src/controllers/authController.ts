import { Request, Response } from 'express';
import Joi from 'joi';
import { AuthService } from '../services/authService';
import { logger } from '../utils/logger';

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(1).max(100).optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

export class AuthController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      // Validate request body
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: { message: error.details[0].message }
        });
      }

      const result = await AuthService.register(value);

      return res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Registration error:', error);
      
      // Handle duplicate email error
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          error: { message: 'User already exists with this email' }
        });
      }

      return res.status(500).json({
        success: false,
        error: { message: 'Internal server error during registration' }
      });
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<Response> {
    try {
      // Validate request body
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: { message: error.details[0].message }
        });
      }

      const result = await AuthService.login(value);

      return res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Login error:', error);

      if (error.message.includes('Invalid email or password')) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid email or password' }
        });
      }

      return res.status(500).json({
        success: false,
        error: { message: 'Internal server error during login' }
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' }
        });
      }

      return res.json({
        success: true,
        data: { user: req.user }
      });
    } catch (error: any) {
      logger.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Internal server error' }
      });
    }
  }

  /**
   * Logout user (client-side token removal)
   */
  static async logout(_req: Request, res: Response): Promise<Response> {
    return res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }

  /**
   * Change user password
   */
  static async changePassword(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { message: 'User not authenticated' }
        });
      }

      // Validate request body
      const { error, value } = changePasswordSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: { message: error.details[0].message }
        });
      }

      await AuthService.changePassword(req.user.id, value);

      return res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error: any) {
      logger.error('Change password error:', error);

      if (error.message.includes('Current password is incorrect')) {
        return res.status(400).json({
          success: false,
          error: { message: 'Current password is incorrect' }
        });
      }

      if (error.message.includes('User not found')) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }

      return res.status(500).json({
        success: false,
        error: { message: 'Internal server error during password change' }
      });
    }
  }
}