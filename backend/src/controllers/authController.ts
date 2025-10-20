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

const passwordResetRequestSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
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

  /**
   * Request password reset
   */
  static async requestPasswordReset(req: Request, res: Response): Promise<Response> {
    try {
      // Validate request body
      const { error, value } = passwordResetRequestSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: { message: error.details[0].message }
        });
      }

      const result = await AuthService.requestPasswordReset(value.email);

      return res.json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      logger.error('Password reset request error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Internal server error during password reset request' }
      });
    }
  }

  /**
   * Reset password using token
   */
  static async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      // Validate request body
      const { error, value } = resetPasswordSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: { message: error.details[0].message }
        });
      }

      const result = await AuthService.resetPassword(value.token, value.newPassword);

      return res.json({
        success: true,
        message: result.message
      });
    } catch (error: any) {
      logger.error('Password reset error:', error);

      if (error.message.includes('Invalid or expired')) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid or expired password reset token' }
        });
      }

      return res.status(500).json({
        success: false,
        error: { message: 'Internal server error during password reset' }
      });
    }
  }

  /**
   * Verify password reset token
   */
  static async verifyPasswordResetToken(req: Request, res: Response): Promise<Response> {
    try {
      const token = req.params.token;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: { message: 'Token is required' }
        });
      }

      const result = await AuthService.verifyPasswordResetToken(token);

      return res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Token verification error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Internal server error during token verification' }
      });
    }
  }

  /**
   * Admin: Get all users
   */
  static async getAllUsers(_req: Request, res: Response): Promise<Response> {
    try {
      const users = await AuthService.getAllUsers();

      return res.json({
        success: true,
        data: { users }
      });
    } catch (error: any) {
      logger.error('Get all users error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Internal server error' }
      });
    }
  }

  /**
   * Admin: Reset user password
   */
  static async adminResetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: { message: 'User ID is required' }
        });
      }

      const result = await AuthService.adminResetUserPassword(userId);

      return res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Admin password reset error:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Internal server error during password reset' }
      });
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(req: Request, res: Response): Promise<Response> {
    try {
      // Validate request body
      const { error, value } = refreshTokenSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: { message: error.details[0].message }
        });
      }

      const result = await AuthService.refreshAccessToken(value.refreshToken);

      return res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Refresh token error:', error);

      if (error.message.includes('Invalid or expired')) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid or expired refresh token' }
        });
      }

      return res.status(500).json({
        success: false,
        error: { message: 'Internal server error during token refresh' }
      });
    }
  }
}