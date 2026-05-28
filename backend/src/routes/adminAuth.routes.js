import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import db from '../models/index.js';
import config from '../config/config.js';
import validate from '../middlewares/validator.js';
import authenticate from '../middlewares/auth.js';
import * as respond from '../utils/respond.js';
import MSG from '../config/messages.js';

const router = express.Router();

/**
 * Generate Access and Refresh tokens
 */
function generateTokens(admin) {
    const payload = {
        id: admin.vv_admin_id,
        name: admin.vv_admin_name,
        role: 'admin'
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.accessTokenExpiry
    });

    const refreshToken = jwt.sign({ id: admin.vv_admin_id }, config.jwt.secret, {
        expiresIn: config.jwt.refreshTokenExpiry
    });

    return { accessToken, refreshToken };
}

/**
 * @route   POST /api/admin/auth/login
 * @desc    Login Admin and return Access & Refresh Token
 */
router.post('/login', [
    body('vv_admin_name').notEmpty().withMessage('Admin username is required'),
    body('vv_admin_password').notEmpty().withMessage('Password is required'),
    validate
], async (req, res, next) => {
    try {
        const { vv_admin_name, vv_admin_password } = req.body;

        // Find active admin
        const admin = await db.VvAdmin.findOne({
            where: {
                vv_admin_name,
                vv_admin_is_deleted: false
            }
        });

        if (!admin) {
            return respond.unauthorized(res, 'Invalid admin username or password');
        }

        // Check status (1 = Active)
        if (admin.vv_admin_satus !== 1) {
            return respond.forbidden(res, 'This admin account is disabled');
        }

        // Verify password
        const isMatch = bcrypt.compareSync(vv_admin_password, admin.vv_admin_password);
        if (!isMatch) {
            return respond.unauthorized(res, 'Invalid admin username or password');
        }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(admin);

        // Save refresh token
        admin.vv_admin_refresh_token = refreshToken;
        await admin.save();

        return respond.ok(res, {
            token: accessToken,
            refreshToken,
            admin: {
                id: admin.vv_admin_id,
                name: admin.vv_admin_name,
                status: admin.vv_admin_satus
            }
        }, 'Admin logged in successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/admin/auth/refresh
 * @desc    Rotate and issue a new Access and Refresh Token
 */
router.post('/refresh', [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    validate
], async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, config.jwt.secret);
        } catch (err) {
            return respond.unauthorized(res, 'Invalid or expired refresh token');
        }

        // Find admin matching ID and matching stored refresh token
        const admin = await db.VvAdmin.findOne({
            where: {
                vv_admin_id: decoded.id,
                vv_admin_refresh_token: refreshToken,
                vv_admin_is_deleted: false
            }
        });

        if (!admin) {
            return respond.unauthorized(res, 'Invalid or revoked refresh token');
        }

        // Verify status
        if (admin.vv_admin_satus !== 1) {
            return respond.forbidden(res, 'This admin account is disabled');
        }

        // Generate new tokens (rotation)
        const tokens = generateTokens(admin);

        // Update stored refresh token
        admin.vv_admin_refresh_token = tokens.refreshToken;
        await admin.save();

        return respond.ok(res, {
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken
        }, 'Tokens rotated successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/admin/auth/logout
 * @desc    Revoke/clear refresh token for admin
 */
router.post('/logout', async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            const admin = await db.VvAdmin.findOne({
                where: {
                    vv_admin_refresh_token: refreshToken
                }
            });
            if (admin) {
                admin.vv_admin_refresh_token = null;
                await admin.save();
            }
        }

        return respond.ok(res, null, 'Logged out successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/admin/auth/profile
 * @desc    Get logged in admin profile
 */
router.get('/profile', authenticate, async (req, res, next) => {
    try {
        // req.user has decoded info (from authenticate middleware)
        const admin = await db.VvAdmin.findOne({
            where: {
                vv_admin_id: req.user.id,
                vv_admin_is_deleted: false
            }
        });

        if (!admin) {
            return respond.notFound(res, 'Admin profile not found');
        }

        return respond.ok(res, {
            id: admin.vv_admin_id,
            name: admin.vv_admin_name,
            status: admin.vv_admin_satus
        }, 'Admin profile retrieved');
    } catch (error) {
        next(error);
    }
});

export default router;
