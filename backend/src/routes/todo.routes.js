import express from 'express';
import { body } from 'express-validator';
import todoController from '../controllers/todoController.js';
import validate from '../middlewares/validator.js';

const router = express.Router();

// Route to get all pending todos
router.get('/pending', todoController.pending);

// Standard CRUD endpoints
router.get('/', todoController.list);
router.get('/:id', todoController.getById);

// POST / create todo with body validation
router.post('/', [
    body('title').notEmpty().withMessage('Title is required'),
    validate
], todoController.create);

// Standard CRUD updates and deletes
router.put('/:id', todoController.update);
router.patch('/:id', todoController.patch);
router.delete('/:id', todoController.remove);

export default router;
