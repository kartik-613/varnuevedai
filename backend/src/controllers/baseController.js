/**
 * Generic Base Controller Factory
 * Connects service layer methods to standardized JSON responses.
 * Implements standard CRUD endpoints automatically.
 */

import MSG from '../config/messages.js';
import * as respond from '../utils/respond.js';

/**
 * Creates generic CRUD controller logic for a given service.
 * 
 * @param {Object} service - A service object (likely from makeService)
 * @param {string} modelName - Human-friendly name of the resource
 */
export function makeController(service, modelName = 'Resource') {
    return {
        /**
         * List records with pagination, sort, search, filter
         */
        async list(req, res, next) {
            try {
                const result = await service.list(req.query);
                return respond.ok(res, result.rows, MSG.CRUD.OK, result.meta);
            } catch (err) {
                next(err);
            }
        },

        /**
         * Get one record by ID
         */
        async getById(req, res, next) {
            try {
                const { id } = req.params;
                const item = await service.getById(id);

                if (!item) {
                    return respond.notFound(res, MSG.CRUD.NOT_FOUND);
                }

                return respond.ok(res, item, MSG.CRUD.OK);
            } catch (err) {
                next(err);
            }
        },

        /**
         * Create a new record
         */
        async create(req, res, next) {
            try {
                const created = await service.create(req.body);
                return respond.created(res, created, MSG.CRUD.CREATED);
            } catch (err) {
                next(err);
            }
        },

        /**
         * Update an existing record
         */
        async update(req, res, next) {
            try {
                const { id } = req.params;
                const updated = await service.update(id, req.body);

                if (!updated) {
                    return respond.notFound(res, MSG.CRUD.NOT_FOUND);
                }

                return respond.ok(res, updated, MSG.CRUD.UPDATED);
            } catch (err) {
                next(err);
            }
        },

        /**
         * Partially update an existing record
         */
        async patch(req, res, next) {
            try {
                const { id } = req.params;
                const updated = await service.update(id, req.body);

                if (!updated) {
                    return respond.notFound(res, MSG.CRUD.NOT_FOUND);
                }

                return respond.ok(res, updated, MSG.CRUD.PATCHED);
            } catch (err) {
                next(err);
            }
        },

        /**
         * Delete a record permanently
         */
        async remove(req, res, next) {
            try {
                const { id } = req.params;
                const result = await service.remove(id);

                if (!result.success) {
                    return respond.notFound(res, result.message);
                }

                return respond.ok(res, null, result.message);
            } catch (err) {
                next(err);
            }
        },

        /**
         * Check if a record exists
         */
        async exists(req, res, next) {
            try {
                const { id } = req.params;
                const exists = await service.exists(id);
                return respond.ok(res, { exists }, MSG.CRUD.OK);
            } catch (err) {
                next(err);
            }
        }
    };
}

export default makeController;
