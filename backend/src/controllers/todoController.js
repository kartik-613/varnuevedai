import { makeController } from './baseController.js';
import todoService from '../services/domain/todoService.js';
import * as respond from '../utils/respond.js';

const todoController = {
    // Basic CRUD controller from Factory
    ...makeController(todoService, 'Todo'),

    /**
     * Custom endpoint for fetching all pending todos
     */
    async pending(req, res, next) {
        try {
            const pending = await todoService.getPendingTodos();
            return respond.ok(res, pending, 'Pending todos retrieved successfully');
        } catch (err) {
            next(err);
        }
    }
};

export default todoController;
