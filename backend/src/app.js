import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import routes from './routes/index.js';
import * as respond from './utils/respond.js';
import errorHandler from './middlewares/errorHandler.js';
import config from './config/config.js';

const app = express();

// Trust proxy for correct client IP detection
app.set('trust proxy', true);

// Helmet for security headers
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const limiter = rateLimit({
    windowMs: config.security.rateLimit.windowMs,
    max: config.security.rateLimit.max,
    message: { success: false, message: config.security.rateLimit.message },
    standardHeaders: true,
    legacyHeaders: false,
    validate: { trustProxy: false },
});

// CORS Configuration
const corsOptions = {
    origin: config.security.cors.origin,
    credentials: config.security.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: config.app.jsonLimit }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use('/public', express.static(path.join(process.cwd(), 'public')));
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));
app.use('/exports', express.static(path.join(process.cwd(), 'public', 'exports')));

// HEALTH CHECK
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Basic Root Route
app.get('/', (req, res) => {
    respond.ok(res, {
        success: true,
        message: 'Welcome to Node Boilerplate API',
        environment: process.env.NODE_ENV,
        status: 'Operational',
    });
});

console.log(`[App] Mounting API routes on prefix: "${config.app.apiPrefix || '/api'}"`);
app.use(config.app.apiPrefix || '/api', routes);

// 404 Not Found Handler
app.use((req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.status = 404;
    error.isOperational = true;
    next(error);
});

app.use(errorHandler);

export default app;
