import { Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../utils/response.handler';
import logger from '../config/logger';
import { JwtAdminPayload } from '../types/admin.types';
import { AuthRequest } from '../types/express.d';
import Admin from '../models/Admin';

// Helper to generate tokens with a flat payload
const generateTokens = (admin: {id: number, username: string}) => {
    const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET || 'default_access_secret';
    const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET || 'default_refresh_secret';
    const accessTokenExpiry = (process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m') as string;
    const refreshTokenExpiry = (process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d') as string;

    const payload = { id: admin.id, username: admin.username };

    // @ts-ignore
    const accessToken = jwt.sign(payload, accessTokenSecret as jwt.Secret, { expiresIn: accessTokenExpiry });
    // @ts-ignore
    const refreshToken = jwt.sign(payload, refreshTokenSecret as jwt.Secret, { expiresIn: refreshTokenExpiry });

    return { accessToken, refreshToken };
};

export const login = async (req: AuthRequest, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        logger.warn(`Login attempt failed: Missing credentials from IP: ${req.ip}`);
        return ApiResponse.error(res, 'Please provide username and password', null, 400);
    }

    try {
        const admin = await Admin.findByUsername(username);

        if (!admin) {
            logger.warn(`Login failed: Invalid credentials for username '${username}'`);
            return ApiResponse.error(res, 'Invalid credentials', null, 401);
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            logger.warn(`Login failed: Invalid credentials for username '${username}'`);
            return ApiResponse.error(res, 'Invalid credentials', null, 401);
        }

        const { accessToken, refreshToken } = generateTokens({ id: admin.id, username: admin.username });

        await Admin.update(admin.id, { refreshToken });

        logger.info(`Admin '${username}' logged in successfully.`);
        return ApiResponse.success(res, 'Login successful', { accessToken, refreshToken });

    } catch (error) {
        logger.error('Login process failed with an exception', { error });
        return ApiResponse.error(res, 'Server error during login');
    }
};

export const refreshToken = async (req: AuthRequest, res: Response) => {
    const { token } = req.body;

    if (!token) {
        return ApiResponse.error(res, 'Refresh token is required', null, 400);
    }

    try {
        const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET || 'default_refresh_secret';
        const decoded = jwt.verify(token, refreshTokenSecret) as JwtAdminPayload;
        const { username } = decoded;

        const user = await Admin.findByUsernameAndRefreshToken(username, token);

        if (!user) {
            logger.warn(`Refresh token reuse attempt for user: ${username}`);
            return ApiResponse.error(res, 'Invalid refresh token', null, 403);
        }

        const { accessToken } = generateTokens({ id: user.id, username: user.username });
        
        logger.info(`Token refreshed for user: ${username}`);
        return ApiResponse.success(res, 'Access token refreshed', { accessToken });

    } catch (error) {
        logger.error('Refresh token failed validation', { error });
        return ApiResponse.error(res, 'Invalid refresh token', null, 403);
    }
};

export const logout = async (req: AuthRequest, res: Response) => {
    const { token } = req.body;

    if (!token) {
        return ApiResponse.error(res, 'Refresh token is required', null, 400);
    }

    try {
        await Admin.clearRefreshToken(token);
        logger.info('User logged out successfully by invalidating refresh token.');
        return ApiResponse.success(res, 'Logout successful');

    } catch (error) {
        logger.error('Logout failed', { error });
        return ApiResponse.error(res, 'Server error during logout');
    }
};

export const status = (req: AuthRequest, res: Response) => {
    try {
        const adminPayload = req.admin as JwtAdminPayload;
        const expiresAt = adminPayload.exp;

        if (!expiresAt) {
            return ApiResponse.error(res, 'Expiration time not found in token', null, 500);
        }
        
        const now = Math.floor(Date.now() / 1000);
        const expiresIn = expiresAt - now;

        logger.info(`Session status checked for user: ${adminPayload.username}`);

        return ApiResponse.success(res, 'Token is valid', {
            user: { id: adminPayload.id, username: adminPayload.username },
            expiresAt: new Date(expiresAt * 1000).toUTCString(),
            expiresIn,
        });

    } catch (error) {
        logger.error('Could not determine session status', { error });
        return ApiResponse.error(res, 'Server error while checking status');
    }
};