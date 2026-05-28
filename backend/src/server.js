import logger from './utils/logger.js';
import app from './app.js';
import models from './models/index.js';
import config from './config/config.js';

// If you have lookups, import them here
// import { loadLookups } from './utils/lookupCache.js';

const port = config.app.port || 4000;

async function start() {
    const startTime = Date.now();

    try {
        // Ensure DB connection
        await models.sequelize.authenticate();
        logger.info('Database connected successfully');

        // Load lookup constants if needed
        // await loadLookups();

        // Set SKIP_SYNC=true in your .env to skip
        if (process.env.SKIP_SYNC === 'true') {
            logger.info('Skipping model sync (SKIP_SYNC=true)');
        } else {
            logger.info('Syncing models...');
            await models.sequelize.sync({ alter: true });
            logger.info('Models synced successfully');
        }

        const listenArgs = typeof port === 'string' ? [port] : [port, '0.0.0.0'];

        app.listen(...listenArgs, () => {
            const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
            const host = config.app.hostIp || 'localhost';

            if (typeof port === 'string') {
                logger.info(`Server running on IIS Named Pipe: ${port} (${totalTime}s)`);
            } else {
                logger.info(`Server running on http://${host}:${port} (${totalTime}s)`);
            }
        });

    } catch (err) {
        logger.error('CRITICAL: Failed to start server', { stack: err.stack, message: err.message });
        process.exit(1);
    }
}

await start();
