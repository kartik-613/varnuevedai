/**
 * Sample User Service 
 * Extends the Base Service with custom logic for users (e.g. hashing passwords).
 */

import { makeService } from '../baseService.js';
import db from '../../models/index.js';

const userService = {
    // Standard CRUD base from Factory 
    ...makeService(db.User, 'User'),

    /**
     * Override create to handle password hashing (placeholder)
     * Real production logic should use bcrypt.hash() here.
     * @param {Object} payload 
     */
    async create(payload) {
        // Example: payload.password = await bcrypt.hash(payload.password, 10);
        return db.User.create(payload);
    },

    /**
     * Add custom business-logic finders here
     * @param {string} email 
     */
    async findByEmail(email) {
        return db.User.findOne({ where: { email } });
    },

    /**
     * Add custom complex reports here 
     */
    async getUserStats() {
        return db.User.count({
            group: ['role']
        });
    }
};

export default userService;
