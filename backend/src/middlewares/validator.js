import { validationResult } from 'express-validator';
import * as respond from '../utils/respond.js';
import MSG from '../config/messages.js';

/**
 * Validation Middleware 
 * Central handler for express-validator results.
 * If validation fails, returns a 400 Bad Request with all error details.
 * If pass, proceeds to the controller.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(err => ({
            field: err.path,
            message: err.msg,
            value: err.value
        }));
        
        return respond.badReq(res, MSG.CRUD.VALIDATION_FAILED, formattedErrors);
    }
    next();
};

export default validate;
