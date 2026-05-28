import logger from '../utils/logger.js';
import * as respond from '../utils/respond.js';
import MSG from '../config/messages.js';

/**
 * Global Error Handler Middleware
 * Catches all errors from async routes and standard middleware.
 * Standardizes the error response format.
 */
const errorHandler = (err, req, res, next) => {
    const statusCode = err.status || 500;
    const message = err.message || MSG.SERVER.INTERNAL_ERROR;

    // Log the error for observability
    logger.error(`[${req.method}] ${req.originalUrl} - ${err.stack || err.message}`);

    // If response headers are already sent, let the default express error handler take over
    if (res.headersSent) {
        return next(err);
    }

    // Standardized error response
    return res.status(statusCode).json({
        success: false,
        message,
        // Include detailed error information ONLY in development
        error: process.env.NODE_ENV === 'development' ? {
            stack: err.stack,
            context: err.context || null
        } : undefined
    });
};

export default errorHandler;
