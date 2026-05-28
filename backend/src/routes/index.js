import express from 'express';
import userRouter from './user.routes.js';
import todoRouter from './todo.routes.js';
import adminAuthRouter from './adminAuth.routes.js';
import dashboardRouter from './dashboard.routes.js';
import organizationRouter from './organizationRoutes.js';

const router = express.Router();

/**
 * Main API Routes Hub
 */

router.use('/users', userRouter);
router.use('/todos', todoRouter);
router.use('/admin/auth', adminAuthRouter);
router.use('/dashboard', dashboardRouter);
router.use('/organizations', organizationRouter);

export default router;
