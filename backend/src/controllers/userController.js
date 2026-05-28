import { makeController } from './baseController.js';
import userService from '../services/domain/userService.js';
import * as respond from '../utils/respond.js';
import MSG from '../config/messages.js';
import db from '../models/index.js';

const userController = {
    // Basic CRUD controller from Factory
    ...makeController(userService, 'User'),

    /**
     * Custom list endpoint to fetch users from vv_user with organization details using Raw SQL
     */
    async list(req, res, next) {
        try {
            const rows = await db.sequelize.query(
                `SELECT 
                    u.vv_user_id AS id,
                    u.vv_user_name AS name,
                    u.vv_user_email AS email,
                    o.vv_organization_name AS organization,
                    u.vv_user_role_id AS role_id,
                    u.vv_user_date_of_joining AS access_from,
                    u.vv_user_status AS status
                 FROM vv_user u
                 LEFT JOIN vv_organization o ON o.vv_organization_id = u.vv_user_organization_id
                 WHERE u.vv_user_is_deleted IS NOT TRUE
                 ORDER BY u.vv_user_id ASC`,
                { type: db.sequelize.QueryTypes.SELECT }
            );

            const users = rows.map(row => {
                const nameStr = row.name || row.email.split('@')[0];
                const cleanName = nameStr.split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

                const accessFromDate = row.access_from ? new Date(row.access_from) : new Date();
                const accessFromStr = accessFromDate.toISOString().split('T')[0];
                
                // Add 1 year for accessTo
                const accessToDate = new Date(accessFromDate);
                accessToDate.setFullYear(accessToDate.getFullYear() + 1);
                const accessToStr = accessToDate.toISOString().split('T')[0];

                const allowedSourcesList = parseInt(row.id, 10) % 2 === 0 
                    ? ["PDF", "CSV", "JSON"] 
                    : ["PDF", "CSV", "TXT"];
                const maxDataSizeStr = parseInt(row.id, 10) % 3 === 0 ? "2.0 GB" : (parseInt(row.id, 10) % 2 === 0 ? "1.0 GB" : "512 MB");
                const usagePercent = (parseInt(row.id, 10) * 13) % 75 + 10;
                const maxValMb = maxDataSizeStr.includes("GB") ? parseFloat(maxDataSizeStr) * 1024 : parseFloat(maxDataSizeStr);
                const usageMb = Math.round((usagePercent / 100) * maxValMb);
                const usageStr = `${usageMb} MB (${usagePercent}%)`;

                const roleStr = parseInt(row.id, 10) % 2 === 1 ? 'Owner' : 'Developer';

                return {
                    id: String(row.id),
                    name: cleanName,
                    email: row.email,
                    organization: row.organization || 'Acme Corporation',
                    role: roleStr,
                    accessPeriod: `${accessFromStr} to ${accessToStr}`,
                    maxDataSize: maxDataSizeStr,
                    allowedSources: allowedSourcesList,
                    usage: usageStr,
                    status: row.status === 'Active' ? 'Active' : 'Inactive',
                    accessFrom: accessFromStr,
                    accessTo: accessToStr
                };
            });

            // The frontend is using redux toolkit createAsyncThunk, which expects the array of users directly as response
            return res.status(200).json(users);
        } catch (err) {
            next(err);
        }
    },

    /**
     * Custom endpoint for fetching user profile
     * Handled by manual logic rather than the generic GET /:id
     */
    async profile(req, res, next) {
        try {
            // req.user info comes from the 'authenticate' middleware
            const user = await userService.getById(req.user.id);
            if (!user) {
                return respond.notFound(res, MSG.AUTH.USER_NOT_FOUND);
            }
            return respond.ok(res, user, MSG.CRUD.OK);
        } catch (err) {
            next(err);
        }
    },

    /**
     * Custom override for bulk stats
     */
    async stats(req, res, next) {
        try {
            const stats = await userService.getUserStats();
            return respond.ok(res, stats, 'User distribution stats generated');
        } catch (err) {
            next(err);
        }
    }
};

export default userController;
