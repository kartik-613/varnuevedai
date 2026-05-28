/**
 * Generic Base Service Factory
 * Provides common CRUD database operations for any data model.
 * Currently optimized for Sequelize ORM but can be adapted.
 */

import MSG from '../config/messages.js';

/**
 * Creates a generic CRUD service for a given database model.
 * 
 * @param {Object} model - The database model (Sequelize, etc.)
 * @param {string} modelName - Human-friendly name of the model
 */
export function makeService(model, modelName = 'Resource') {
    if (!model) {
        throw new Error(MSG.CRUD.MODEL_NOT_FOUND(modelName));
    }

    return {
        /**
         * List records with basic pagination and searching
         * @param {Object} query - Request query parameters
         */
        async list(query = {}) {
            const {
                page = 1,
                limit = 10,
                search = '',
                sortBy = 'id',
                sortOrder = 'desc',
                ...filters
            } = query;

            const pageNum = Math.max(1, Number.parseInt(page) || 1);
            const limitNum = Math.min(100, Math.max(1, Number.parseInt(limit) || 10));
            const offset = (pageNum - 1) * limitNum;

            // Base query options
            const options = {
                where: { ...filters },
                limit: limitNum,
                offset,
                order: [[sortBy, sortOrder.toUpperCase()]],
                distinct: true
            };

            // Implement simple search if search term exists and model has search scope or logic
            // This is ORM-specific (Sequelize example below)
            /*
            if (search && model.sequelize) {
                const { Op } = model.sequelize;
                options.where[Op.or] = [
                    { name: { [Op.iLike]: `%${search}%` } },
                    // add other searchable fields
                ];
            }
            */

            const { rows, count } = await model.findAndCountAll(options);
            const totalPages = Math.ceil(count / limitNum);

            return {
                rows,
                meta: {
                    page: pageNum,
                    limit: limitNum,
                    total: count,
                    totalPages,
                    hasNextPage: pageNum < totalPages,
                    hasPrevPage: pageNum > 1
                }
            };
        },

        /**
         * Get a single record by primary key (id)
         * @param {string|number} id 
         */
        async getById(id) {
            return model.findByPk(id);
        },

        /**
         * Create a new record
         * @param {Object} payload 
         */
        async create(payload) {
            return model.create(payload);
        },

        /**
         * Update an existing record
         * @param {string|number} id 
         * @param {Object} payload 
         */
        async update(id, payload) {
            const [affectedRows] = await model.update(payload, { 
                where: { id },
                returning: true // specific to some dialects like Postgres
            });

            if (affectedRows === 0) return null;
            return model.findByPk(id);
        },

        /**
         * Delete a record permanently
         * @param {string|number} id 
         */
        async remove(id) {
            const deleted = await model.destroy({ where: { id } });
            return {
                success: deleted > 0,
                message: deleted > 0 ? MSG.CRUD.DELETED : MSG.CRUD.NOT_FOUND
            };
        },

        /**
         * Bulk create records
         * @param {Array} records 
         */
        async bulkCreate(records) {
            return model.bulkCreate(records);
        },

        /**
         * Check if a record exists
         * @param {string|number} id 
         */
        async exists(id) {
            const count = await model.count({ where: { id } });
            return count > 0;
        }
    };
}

export default makeService;
