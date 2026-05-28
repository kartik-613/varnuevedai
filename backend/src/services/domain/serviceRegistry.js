import { makeService } from '../baseService.js';
import todoService from './todoService.js';
import userService from './userService.js';

const services = {
    Todo: todoService,
    User: userService,
};

/**
 * Registry to manage model-specific domain services
 */
export const serviceRegistry = {
    /**
     * Register a domain service for a model
     * @param {string} modelName 
     * @param {Object} service 
     */
    register(modelName, service) {
        services[modelName] = service;
    },

    /**
     * Get a service for a model. Falls back to base makeService if no domain service registered.
     * @param {string} modelName 
     * @param {Object} options 
     * @returns {Object}
     */
    getService(modelName, options = {}) {
        let service;
        if (services[modelName]) {
            service = services[modelName];
        } else {
            service = makeService(modelName, options);
        }

        if (service) {
            service.options = { ...service.options, ...options };
        }

        return service;
    }
};

export default serviceRegistry;
