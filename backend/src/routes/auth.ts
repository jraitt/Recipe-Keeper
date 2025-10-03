import express from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', AuthController.register);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', AuthController.login);

/**
 * @route GET /api/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', authenticateToken, AuthController.getProfile);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Public
 */
router.post('/logout', AuthController.logout);

/**
 * @route PUT /api/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.put('/change-password', authenticateToken, AuthController.changePassword);

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post('/forgot-password', AuthController.requestPasswordReset);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password using token
 * @access Public
 */
router.post('/reset-password', AuthController.resetPassword);

/**
 * @route GET /api/auth/verify-reset-token/:token
 * @desc Verify password reset token
 * @access Public
 */
router.get('/verify-reset-token/:token', AuthController.verifyPasswordResetToken);

/**
 * @route GET /api/auth/admin/users
 * @desc Get all users (Admin only)
 * @access Private (Admin)
 */
router.get('/admin/users', authenticateToken, requireAdmin, AuthController.getAllUsers);

/**
 * @route POST /api/auth/admin/users/:userId/reset-password
 * @desc Admin reset user password
 * @access Private (Admin)
 */
router.post('/admin/users/:userId/reset-password', authenticateToken, requireAdmin, AuthController.adminResetPassword);

export default router;