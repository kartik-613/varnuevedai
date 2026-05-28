/**
 * Standardized API Response Logic
 * Ensures consistent response format {success, message, data, errors, meta}
 */

/**
 * Send a success response (200 OK)
 * @param {Response} res 
 * @param {any} data 
 * @param {string} message 
 * @param {Object} meta 
 */
export const ok = (res, data = null, message = 'Success', meta = null) => {
    return res.status(200).json({
        success: true,
        message,
        data,
        meta
    });
};

/**
 * Send a created response (201 Created)
 * @param {Response} res 
 * @param {any} data 
 * @param {string} message 
 */
export const created = (res, data = null, message = 'Resource created successfully') => {
    return res.status(201).json({
        success: true,
        message,
        data
    });
};

/**
 * Send a bad request error (400 Bad Request)
 * @param {Response} res 
 * @param {string} message 
 * @param {any} errors 
 */
export const badReq = (res, message = 'Bad request', errors = null) => {
    return res.status(400).json({
        success: false,
        message,
        errors
    });
};

/**
 * Send an unauthorized error (401 Unauthorized)
 * @param {Response} res 
 * @param {string} message 
 */
export const unauthorized = (res, message = 'Unauthorized access') => {
    return res.status(401).json({
        success: false,
        message
    });
};

/**
 * Send a forbidden error (403 Forbidden)
 * @param {Response} res 
 * @param {string} message 
 */
export const forbidden = (res, message = 'Forbidden access') => {
    return res.status(403).json({
        success: false,
        message
    });
};

/**
 * Send a not found error (404 Not Found)
 * @param {Response} res 
 * @param {string} message 
 */
export const notFound = (res, message = 'Resource not found') => {
    return res.status(404).json({
        success: false,
        message
    });
};

/**
 * Send a generic server error (500 Internal Server Error)
 * @param {Response} res 
 * @param {string} message 
 * @param {any} error 
 */
export const internalError = (res, message = 'Internal server error', error = null) => {
    return res.status(500).json({
        success: false,
        message,
        error: process.env.NODE_ENV === 'development' ? error : undefined
    });
};
