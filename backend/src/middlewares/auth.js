import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import * as respond from '../utils/respond.js';
import MSG from '../config/messages.js';

/**
 * Authentication Middleware 
 * Validates the presence and validity of the Authorization: Bearer <token> header.
 * Attaches the decoded user payload to req.user for use in downstream routes.
 */
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return respond.unauthorized(res, MSG.AUTH.UNAUTHORIZED);
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return respond.unauthorized(res, MSG.AUTH.UNAUTHORIZED);
        }

        // Verify token
        const decoded = jwt.verify(token, config.jwt.secret);
        
        // Attach user info to request
        req.user = decoded;
        
        next();
    } catch (err) {
        // Log auth failure for security auditing (excluding token)
        console.warn(`[Auth] Authentication failed: ${err.message}`);
        return respond.unauthorized(res, MSG.AUTH.UNAUTHORIZED);
    }
};

/**
 * Role-based Authorization Middleware 
 * Ensures the authenticated user has at least one of the required roles.
 * @param {string[]} allowedRoles - List of authorized role names
 */
export const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return respond.unauthorized(res, MSG.AUTH.UNAUTHORIZED);
        }

        const userRoles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.role];
        const hasRole = userRoles.some(role => allowedRoles.includes(role));

        if (!hasRole) {
            return respond.forbidden(res, MSG.AUTH.FORBIDDEN);
        }

        next();
    };
};

export default authenticate;
