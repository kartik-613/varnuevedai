import express from "express";
import { serviceRegistry } from "../services/domain/serviceRegistry.js";
import authenticate from "../middlewares/auth.js"; // Standard auth
import { makeController } from "../controllers/baseController.js";

/**
 * Generic Resource Router Factory
 * Dynamically creates a complete CRUD interface for any model name.
 * Automatically resolves the correct service (base or domain-specific).
 * 
 * @param {string} modelName - Name of the Sequelize model
 * @param {Object} options - Custom configuration (auth overrides, etc.)
 */
export function resourceRouter(modelName, options = {}) {
    const router = express.Router();

    // Default to strict authentication for read/write if not provided
    const readAuth = options.readAuth || authenticate;
    const writeAuth = options.writeAuth || authenticate;

    // Dynamically fetch the service from the registry
    const service = serviceRegistry.getService(modelName, options);

    if (!service) {
        console.error(`[ResourceRouter] No service found for ${modelName}`);
        return router;
    }

    // Wrap the service in a generic controller
    const controller = makeController(service, modelName);

    /**
     * Standardized CRUD Endpoints
     */
    router.get("/", readAuth, controller.list);
    router.post("/", writeAuth, controller.create);

    router.get("/:id", readAuth, controller.getById);
    router.put("/:id", writeAuth, controller.update);
    router.patch("/:id", writeAuth, controller.patch);
    router.delete("/:id", writeAuth, controller.remove);

    // Support generic exists check if needed
    router.get("/:id/exists", readAuth, controller.exists);

    return router;
}

export default resourceRouter;
