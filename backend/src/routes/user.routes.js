import express from 'express';
import { body } from 'express-validator';
import userController from '../controllers/userController.js';
import validate from '../middlewares/validator.js';
import authenticate, { authorize } from '../middlewares/auth.js';

const router = express.Router();

/**
 * User Module Routes 
 * Demonstrates basic CRUD, authentication, and validation usage.
 */

/**
 * PUBLIC ROUTES
 */

// Example: Get basic stats anonymously
router.get('/stats', userController.stats);

// POST / create user with body validation
router.post('/', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('name').notEmpty().withMessage('Name is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate
], userController.create);

/**
 * PROTECTED ROUTES 
 * (Require JWT header: Authorization Bearer <token>)
 */
router.use(authenticate);

// Get current user profile
router.get('/profile', userController.profile);

// Standard CRUD endpoints
router.get('/', userController.list);
router.get('/:id', userController.getById);

/**
 * RESTRICTED ROUTES 
 * (Requires specific role like 'admin')
 */
router.use(authorize(['admin']));

router.put('/:id', userController.update);
router.patch('/:id', userController.patch);
router.delete('/:id', userController.remove);

export default router;
