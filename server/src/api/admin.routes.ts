import { Router, Request, Response, NextFunction } from 'express';
import { login, refreshToken, logout, status } from '../controllers/admin.controller';
import { protect } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/express.d';

const router = Router();

/**
 * @route   POST /api/v1/admin/login
 * @desc    Authenticate admin and get tokens
 * @access  Public
 * @body    { "username": "admin_username", "password": "admin_password" }
 * @response 200 { "success": true, "message": "Login successful", "data": { "accessToken": "jwt.access.token", "refreshToken": "jwt.refresh.token" } }
 * @response 400 { "success": false, "message": "Please provide username and password" }
 * @response 401 { "success": false, "message": "Invalid credentials" }
 * @response 500 { "success": false, "message": "Server error" }
 */
router.post('/login', login);

/**
 * @route   POST /api/v1/admin/refresh
 * @desc    Get a new access token using a refresh token
 * @access  Public (requires a valid refresh token)
 * @body    { "token": "jwt.refresh.token" }
 * @response 200 { "success": true, "message": "Access token refreshed", "data": { "accessToken": "new.jwt.access.token" } }
 * @response 400 { "success": false, "message": "Refresh token is required" }
 * @response 403 { "success": false, "message": "Invalid refresh token" }
 * @response 500 { "success": false, "message": "Server error" }
 */
router.post('/refresh', refreshToken);

/**
 * @route   POST /api/v1/admin/logout
 * @desc    Logout admin by invalidating the refresh token
 * @access  Public (requires a refresh token to invalidate a session)
 * @body    { "token": "jwt.refresh.token" }
 * @response 200 { "success": true, "message": "Logout successful" }
 * @response 400 { "success": false, "message": "Refresh token is required" }
 * @response 500 { "success": false, "message": "Server error" }
 */
router.post('/logout', logout);

/**
 * @route   GET /api/v1/admin/status
 * @desc    Check the status of the current session token
 * @access  Private (requires a valid access token in 'x-auth-token' header)
 * @headers { "x-auth-token": "jwt.access.token" }
 * @response 200 { "success": true, "message": "Token is valid", "data": { "user": { "id": 1, "username": "admin" }, "expiresAt": "2025-12-24T12:00:00.000Z", "expiresIn": 899 } }
 * @response 401 { "success": false, "message": "Token is not valid" }
 */
router.get('/status', protect, (req: AuthRequest, res: Response) => status(req, res));

/**
 * @route   GET /api/v1/admin/profile
 * @desc    Example of a protected route - Get admin profile data
 * @access  Private (requires a valid access token in 'x-auth-token' header)
 * @headers { "x-auth-token": "jwt.access.token" }
 * @response 200 { "id": 1, "username": "admin_username" }
 * @response 401 { "success": false, "message": "No token, authorization denied" }
 * @response 401 { "success": false, "message": "Token is not valid" }
 */
router.get('/profile', protect, (req: AuthRequest, res: Response) => {
    res.json(req.admin);
});

export default router;
