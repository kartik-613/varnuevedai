/**
 * Todo Domain Service 
 * Extends the Base Service with custom logic specifically for Todos.
 */

import { makeService } from '../baseService.js';
import db from '../../models/index.js';

const todoService = {
    // Standard CRUD base from Factory 
    ...makeService(db.Todo, 'Todo'),

    /**
     * Override delete to soft-delete (if desired)
     * @param {string|number} id 
     */
    async softDelete(id) {
        return db.Todo.update({ isDeleted: true }, { where: { id } });
    },

    /**
     * Custom business-logic finder for incomplete todos
     */
    async getPendingTodos() {
        return db.Todo.findAll({ where: { completed: false, isDeleted: false } });
    }
};

export default todoService;
