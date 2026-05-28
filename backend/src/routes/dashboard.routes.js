import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../models/index.js';
import authenticate from '../middlewares/auth.js';
import * as respond from '../utils/respond.js';

const router = express.Router();

/**
 * @route   GET /api/dashboard/stats
 * @desc    Fetch statistical counts for the admin dashboard (e.g. total active organizations)
 */
router.get('/stats', authenticate, async (req, res, next) => {
    try {
        const [orgResults] = await db.sequelize.query(
            'SELECT COUNT(*) as count FROM vv_organization WHERE vv_organization_is_deleted IS NOT TRUE'
        );
        const totalOrgs = parseInt(orgResults[0].count, 10);

        const [queryResults] = await db.sequelize.query(
            'SELECT COUNT(*) as count FROM vv_query WHERE vv_query_is_deleted IS NOT TRUE'
        );
        const totalQueries = parseInt(queryResults[0].count, 10);

        const [userResults] = await db.sequelize.query(
            "SELECT COUNT(*) as count FROM vv_user WHERE vv_user_status = 'Active' AND vv_user_is_deleted IS NOT TRUE"
        );
        const totalActiveUsers = parseInt(userResults[0].count, 10);

        const [dashboardResults] = await db.sequelize.query(
            "SELECT COUNT(*) as count FROM vv_dashboard WHERE vv_dashboard_status = 'Active' AND vv_dashboard_is_deleted IS NOT TRUE"
        );
        const totalDashboards = parseInt(dashboardResults[0].count, 10);

        const [reportResults] = await db.sequelize.query(
            "SELECT COUNT(*) as count FROM vv_report WHERE vv_report_status = 'Active' AND vv_report_is_deleted IS NOT TRUE"
        );
        const totalReports = parseInt(reportResults[0].count, 10);

        // Fetch query counts grouped by month for the last 6 months (5 months ago to present)
        const today = new Date();
        const oldestMonthDate = new Date(today.getFullYear(), today.getMonth() - 5, 1);

        const trendResults = await db.sequelize.query(
            `SELECT 
                TO_CHAR(vv_query_sent_at, 'YYYY-MM') AS month_key,
                COUNT(*) AS count
             FROM vv_query
             WHERE vv_query_is_deleted IS NOT TRUE
               AND vv_query_sent_at >= :startDate
             GROUP BY TO_CHAR(vv_query_sent_at, 'YYYY-MM')
             ORDER BY month_key ASC`,
            {
                replacements: { startDate: oldestMonthDate },
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        // Generate chronological last 6 months list
        const queryTrend = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthLabel = d.toLocaleString('default', { month: 'short' });
            const yearVal = d.getFullYear();
            const monthKey = `${yearVal}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            queryTrend.push({
                id: `q-${monthKey}`,
                month: monthLabel,
                queries: 0,
                key: monthKey
            });
        }

        // Map DB results to corresponding month entries
        for (const row of trendResults) {
            const match = queryTrend.find(item => item.key === row.month_key);
            if (match) {
                match.queries = parseInt(row.count, 10);
            }
        }

        // Project objects without the helper key
        const cleanedTrend = queryTrend.map(({ id, month, queries }) => ({ id, month, queries }));

        return respond.ok(res, {
            totalOrganizations: totalOrgs,
            totalQueries: totalQueries,
            totalActiveUsers: totalActiveUsers,
            totalDashboards: totalDashboards,
            totalReports: totalReports,
            queryTrend: cleanedTrend
        }, 'Dashboard statistics retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/dashboard/org-summary
 * @desc    Per-organization user count and query count for the Organization Summary table
 */
router.get('/org-summary', authenticate, async (req, res, next) => {
    try {
        const rows = await db.sequelize.query(
            `SELECT
                o.vv_organization_id    AS id,
                o.vv_organization_name  AS name,
                COUNT(DISTINCT u.vv_user_id)  FILTER (WHERE u.vv_user_is_deleted IS NOT TRUE)  AS user_count,
                COUNT(DISTINCT q.vv_query_id) FILTER (WHERE q.vv_query_is_deleted IS NOT TRUE) AS query_count
             FROM vv_organization o
             LEFT JOIN vv_user  u ON u.vv_user_organization_id  = o.vv_organization_id
             LEFT JOIN vv_query q ON q.vv_query_organization_id = o.vv_organization_id
             WHERE o.vv_organization_is_deleted IS NOT TRUE
             GROUP BY o.vv_organization_id, o.vv_organization_name
             ORDER BY o.vv_organization_name ASC`,
            { type: db.sequelize.QueryTypes.SELECT }
        );

        const summary = rows.map(row => ({
            id:         row.id,
            name:       row.name,
            userCount:  parseInt(row.user_count,  10),
            queryCount: parseInt(row.query_count, 10),
        }));

        return respond.ok(res, summary, 'Organization summary retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/dashboard/users
 * @desc    Fetch all users from vv_user joined with vv_organization for admin user management
 */
router.get('/users', authenticate, async (req, res, next) => {
    try {
        const rows = await db.sequelize.query(
            `SELECT
                u.vv_user_id              AS id,
                u.vv_user_name            AS name,
                u.vv_user_email           AS email,
                u.vv_user_status          AS status,
                u.vv_user_date_of_joining AS access_from,
                u.vv_user_code            AS user_code,
                u.vv_user_phone           AS phone,
                o.vv_organization_name    AS organization,
                o.vv_organization_id      AS organization_id
             FROM vv_user u
             LEFT JOIN vv_organization o ON o.vv_organization_id = u.vv_user_organization_id
             WHERE u.vv_user_is_deleted IS NOT TRUE
             ORDER BY u.vv_user_id ASC`,
            { type: db.sequelize.QueryTypes.SELECT }
        );

        const users = rows.map(row => {
            // Format name
            const rawName = row.name || '';
            const name = rawName.trim() || row.email.split('@')[0];

            // Access period: from joining date to +1 year
            const accessFromDate = row.access_from ? new Date(row.access_from) : new Date();
            const accessFromStr = accessFromDate.toISOString().split('T')[0];
            const accessToDate = new Date(accessFromDate);
            accessToDate.setFullYear(accessToDate.getFullYear() + 1);
            const accessToStr = accessToDate.toISOString().split('T')[0];

            return {
                id: String(row.id),
                name: name,
                email: row.email,
                organization: row.organization || 'Unknown',
                role: 'Member',
                accessPeriod: `${accessFromStr} to ${accessToStr}`,
                maxDataSize: '1.0 GB',
                allowedSources: ['PDF', 'CSV', 'TXT'],
                usage: '0 MB (0%)',
                status: row.status === 'Active' ? 'Active' : 'Inactive',
                accessFrom: accessFromStr,
                accessTo: accessToStr,
                phone: row.phone || '',
                userCode: row.user_code || ''
            };
        });

        return respond.ok(res, users, 'Users retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/dashboard/users
 * @desc    Create a new user in vv_user table using raw SQL
 */
router.post('/users', authenticate, async (req, res, next) => {
    try {
        const { name, email, organization, role, status, accessFrom } = req.body;

        if (!name || !email) {
            return respond.badReq(res, 'Name and email are required');
        }

        // Check if a user with this email already exists and is active
        const existing = await db.sequelize.query(
            `SELECT vv_user_id FROM vv_user WHERE LOWER(vv_user_email) = LOWER(:email) AND vv_user_is_deleted IS NOT TRUE LIMIT 1`,
            {
                replacements: { email: email.trim().toLowerCase() },
                type: db.sequelize.QueryTypes.SELECT
            }
        );
        if (existing.length > 0) {
            return respond.badReq(res, 'A user with this email already exists');
        }

        // 1. Resolve organization name to ID (or default to 1)
        let orgId = 1;
        if (organization) {
            const orgRows = await db.sequelize.query(
                `SELECT vv_organization_id AS id 
                 FROM vv_organization 
                 WHERE LOWER(vv_organization_name) = LOWER(:orgName) 
                   AND vv_organization_is_deleted IS NOT TRUE 
                 LIMIT 1`,
                {
                    replacements: { orgName: organization.trim() },
                    type: db.sequelize.QueryTypes.SELECT
                }
            );
            if (orgRows.length > 0) {
                orgId = orgRows[0].id;
            }
        }

        // Map role name to role ID
        // Owner -> 1, Developer -> 2, Member -> 3
        let roleId = 3;
        const lowerRole = (role || '').toLowerCase();
        if (lowerRole.includes('owner')) roleId = 1;
        else if (lowerRole.includes('developer')) roleId = 2;

        // 2. Hash standard secure password
        const passwordHash = bcrypt.hashSync('Password@123', 10);
        const joiningDate = accessFrom ? accessFrom : new Date().toISOString().split('T')[0];

        // Generate a random unique user code: e.g. USR123456
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        const userCode = `USR${randomNum}`;

        // Default phone number to placeholder if not provided
        const userPhone = req.body.phone || '1234567890';

        // 3. Insert into vv_user table using raw SQL
        const [result] = await db.sequelize.query(
            `INSERT INTO vv_user (
                vv_user_name,
                vv_user_email,
                vv_user_password_hash,
                vv_user_organization_id,
                vv_user_department_id,
                vv_user_role_id,
                vv_user_setting_id,
                vv_user_status,
                vv_user_date_of_joining,
                vv_user_is_deleted,
                vv_user_google_authentication,
                vv_user_microsoft_authentication,
                vv_user_created_by,
                vv_user_created_at,
                vv_user_updated_at,
                vv_user_code,
                vv_user_phone
            ) VALUES (
                :name,
                :email,
                :passwordHash,
                :orgId,
                1,
                :roleId,
                0,
                :status,
                :joiningDate,
                false,
                true,
                true,
                :adminId,
                NOW(),
                NOW(),
                :userCode,
                :userPhone
            ) RETURNING vv_user_id AS id`,
            {
                replacements: {
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    passwordHash,
                    orgId,
                    roleId,
                    status: status === 'Active' ? 'Active' : 'Inactive',
                    joiningDate,
                    adminId: req.user.id || 1,
                    userCode,
                    userPhone
                },
                type: db.sequelize.QueryTypes.INSERT
            }
        );

        const newId = result[0].id;

        // Format created user exactly matching frontend `User` format
        const formattedAccessFrom = new Date(joiningDate).toISOString().split('T')[0];
        const accessToDate = new Date(joiningDate);
        accessToDate.setFullYear(accessToDate.getFullYear() + 1);
        const formattedAccessTo = accessToDate.toISOString().split('T')[0];

        const newUser = {
            id: String(newId),
            name: name.trim(),
            email: email.trim().toLowerCase(),
            organization: organization || 'Unknown',
            role: role || 'Member',
            accessPeriod: `${formattedAccessFrom} to ${formattedAccessTo}`,
            maxDataSize: '1.0 GB',
            allowedSources: ['PDF', 'CSV', 'TXT'],
            usage: '0 MB (0%)',
            status: status === 'Active' ? 'Active' : 'Inactive',
            accessFrom: formattedAccessFrom,
            accessTo: formattedAccessTo,
            phone: userPhone,
            userCode: userCode
        };

        return respond.ok(res, newUser, 'User created successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/dashboard/users/:id
 * @desc    Update a user in vv_user table using raw SQL
 */
router.put('/users/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, organization, role, status, accessFrom } = req.body;

        if (!name || !email) {
            return respond.badReq(res, 'Name and email are required');
        }

        // Check if user exists and is not deleted
        const userExists = await db.sequelize.query(
            `SELECT vv_user_id, vv_user_code, vv_user_phone FROM vv_user WHERE vv_user_id = :id AND vv_user_is_deleted IS NOT TRUE LIMIT 1`,
            {
                replacements: { id },
                type: db.sequelize.QueryTypes.SELECT
            }
        );
        if (userExists.length === 0) {
            return respond.notFound(res, 'User not found');
        }

        const existingUser = userExists[0];
        const userCode = existingUser.vv_user_code || '';
        const userPhone = req.body.phone || existingUser.vv_user_phone || '1234567890';

        // Check if email belongs to another active user
        const existingEmail = await db.sequelize.query(
            `SELECT vv_user_id FROM vv_user WHERE LOWER(vv_user_email) = LOWER(:email) AND vv_user_id != :id AND vv_user_is_deleted IS NOT TRUE LIMIT 1`,
            {
                replacements: { email: email.trim().toLowerCase(), id },
                type: db.sequelize.QueryTypes.SELECT
            }
        );
        if (existingEmail.length > 0) {
            return respond.badReq(res, 'A user with this email already exists');
        }

        // Resolve organization name to ID (or default to 1)
        let orgId = 1;
        if (organization) {
            const orgRows = await db.sequelize.query(
                `SELECT vv_organization_id AS id 
                 FROM vv_organization 
                 WHERE LOWER(vv_organization_name) = LOWER(:orgName) 
                   AND vv_organization_is_deleted IS NOT TRUE 
                 LIMIT 1`,
                {
                    replacements: { orgName: organization.trim() },
                    type: db.sequelize.QueryTypes.SELECT
                }
            );
            if (orgRows.length > 0) {
                orgId = orgRows[0].id;
            }
        }

        // Map role name to role ID
        let roleId = 3;
        const lowerRole = (role || '').toLowerCase();
        if (lowerRole.includes('owner')) roleId = 1;
        else if (lowerRole.includes('developer')) roleId = 2;

        const joiningDate = accessFrom ? accessFrom : new Date().toISOString().split('T')[0];

        // Update vv_user table using raw SQL
        await db.sequelize.query(
            `UPDATE vv_user SET
                vv_user_name = :name,
                vv_user_email = :email,
                vv_user_organization_id = :orgId,
                vv_user_role_id = :roleId,
                vv_user_status = :status,
                vv_user_date_of_joining = :joiningDate,
                vv_user_phone = :userPhone,
                vv_user_updated_at = NOW(),
                vv_user_updated_by = :adminId
             WHERE vv_user_id = :id AND vv_user_is_deleted IS NOT TRUE`,
            {
                replacements: {
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    orgId,
                    roleId,
                    status: status === 'Active' ? 'Active' : 'Inactive',
                    joiningDate,
                    userPhone,
                    adminId: req.user.id || 1,
                    id
                },
                type: db.sequelize.QueryTypes.UPDATE
            }
        );

        // Format updated user matching frontend `User` format
        const formattedAccessFrom = new Date(joiningDate).toISOString().split('T')[0];
        const accessToDate = new Date(joiningDate);
        accessToDate.setFullYear(accessToDate.getFullYear() + 1);
        const formattedAccessTo = accessToDate.toISOString().split('T')[0];

        const updatedUser = {
            id: String(id),
            name: name.trim(),
            email: email.trim().toLowerCase(),
            organization: organization || 'Unknown',
            role: role || 'Member',
            accessPeriod: `${formattedAccessFrom} to ${formattedAccessTo}`,
            maxDataSize: '1.0 GB',
            allowedSources: ['PDF', 'CSV', 'TXT'],
            usage: '0 MB (0%)',
            status: status === 'Active' ? 'Active' : 'Inactive',
            accessFrom: formattedAccessFrom,
            accessTo: formattedAccessTo,
            phone: userPhone,
            userCode: userCode
        };

        return respond.ok(res, updatedUser, 'User updated successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/dashboard/users/:id
 * @desc    Soft delete a user in vv_user table using raw SQL
 */
router.delete('/users/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if user exists and is not deleted
        const userExists = await db.sequelize.query(
            `SELECT vv_user_id FROM vv_user WHERE vv_user_id = :id AND vv_user_is_deleted IS NOT TRUE LIMIT 1`,
            {
                replacements: { id },
                type: db.sequelize.QueryTypes.SELECT
            }
        );
        if (userExists.length === 0) {
            return respond.notFound(res, 'User not found');
        }

        // Perform soft delete using raw SQL
        await db.sequelize.query(
            `UPDATE vv_user SET
                vv_user_is_deleted = true,
                vv_user_deleted_at = NOW(),
                vv_user_deleted_by = :adminId
             WHERE vv_user_id = :id`,
            {
                replacements: {
                    adminId: req.user.id || 1,
                    id
                },
                type: db.sequelize.QueryTypes.UPDATE
            }
        );

        return respond.ok(res, null, 'User soft-deleted successfully');
    } catch (error) {
        next(error);
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// VV_RESOURCE CRUD ROUTES
// Base path: /api/dashboard/resources
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @route   GET /api/dashboard/resources
 * @desc    Fetch all resource allocation records joined with organization name
 */
router.get('/resources', authenticate, async (req, res, next) => {
    try {
        const rows = await db.sequelize.query(
            `SELECT
                r.vv_resource_id                       AS id,
                r.vv_resource_organisation             AS organisation_id,
                o.vv_organization_name                 AS organisation_name,
                r.vv_resource_data_source_org_id       AS data_source_org_id,
                r.vv_resource_storage_limit            AS storage_limit,
                r.vv_resource_subscription_plan        AS subscription_plan,
                r.vv_resource_user_limit               AS user_limit,
                r.vv_resource_access_period_start_date AS access_start,
                r.vv_resource_access_period_end_date   AS access_end,
                r.vv_resource_created_at               AS created_at,
                r.vv_resource_updated_at               AS updated_at,
                r.vv_resource_is_deleted               AS is_deleted
             FROM vv_resource r
             LEFT JOIN vv_organization o ON o.vv_organization_id = r.vv_resource_organisation
             WHERE r.vv_resource_is_deleted IS NOT TRUE
             ORDER BY r.vv_resource_id ASC`,
            { type: db.sequelize.QueryTypes.SELECT }
        );

        const resources = rows.map(row => ({
            id: row.id,
            organisationId: row.organisation_id,
            organisationName: row.organisation_name || 'Unknown',
            dataSourceOrgId: row.data_source_org_id,
            storageLimit: row.storage_limit,
            storageLimitGB: (Number(row.storage_limit) / 1073741824).toFixed(2) + ' GB',
            subscriptionPlan: row.subscription_plan,
            userLimit: row.user_limit,
            accessStart: row.access_start,
            accessEnd: row.access_end,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));

        return respond.ok(res, resources, 'Resources retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/dashboard/resources/:id
 * @desc    Fetch a single resource allocation record by ID
 */
router.get('/resources/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const rows = await db.sequelize.query(
            `SELECT
                r.vv_resource_id                       AS id,
                r.vv_resource_organisation             AS organisation_id,
                o.vv_organization_name                 AS organisation_name,
                r.vv_resource_data_source_org_id       AS data_source_org_id,
                r.vv_resource_storage_limit            AS storage_limit,
                r.vv_resource_subscription_plan        AS subscription_plan,
                r.vv_resource_user_limit               AS user_limit,
                r.vv_resource_access_period_start_date AS access_start,
                r.vv_resource_access_period_end_date   AS access_end,
                r.vv_resource_created_at               AS created_at,
                r.vv_resource_updated_at               AS updated_at
             FROM vv_resource r
             LEFT JOIN vv_organization o ON o.vv_organization_id = r.vv_resource_organisation
             WHERE r.vv_resource_id = :id AND r.vv_resource_is_deleted IS NOT TRUE
             LIMIT 1`,
            {
                replacements: { id },
                type: db.sequelize.QueryTypes.SELECT
            }
        );

        if (rows.length === 0) {
            return respond.notFound(res, 'Resource record not found');
        }

        const row = rows[0];
        return respond.ok(res, {
            id: row.id,
            organisationId: row.organisation_id,
            organisationName: row.organisation_name || 'Unknown',
            dataSourceOrgId: row.data_source_org_id,
            storageLimit: row.storage_limit,
            storageLimitGB: (Number(row.storage_limit) / 1073741824).toFixed(2) + ' GB',
            subscriptionPlan: row.subscription_plan,
            userLimit: row.user_limit,
            accessStart: row.access_start,
            accessEnd: row.access_end,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }, 'Resource retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/dashboard/resources
 * @desc    Create a new resource allocation record
 * Body: { organisationId, dataSourceOrgId, storageLimitGB, subscriptionPlan, userLimit, accessStart, accessEnd }
 */
router.post('/resources', authenticate, async (req, res, next) => {
    try {
        const {
            organisationId,
            dataSourceOrgId,
            storageLimitGB,
            subscriptionPlan,
            userLimit,
            accessStart,
            accessEnd
        } = req.body;

        if (!organisationId || !accessStart || !accessEnd) {
            return respond.badReq(res, 'organisationId, accessStart, and accessEnd are required');
        }

        // Validate organization exists
        const orgCheck = await db.sequelize.query(
            `SELECT vv_organization_id, vv_organization_name FROM vv_organization WHERE vv_organization_id = :orgId AND vv_organization_is_deleted IS NOT TRUE LIMIT 1`,
            {
                replacements: { orgId: organisationId },
                type: db.sequelize.QueryTypes.SELECT
            }
        );
        if (orgCheck.length === 0) {
            return respond.badReq(res, 'Organization not found');
        }

        // Convert GB to bytes (default 1 GB if not provided)
        const storageLimitBytes = storageLimitGB
            ? Math.round(parseFloat(storageLimitGB) * 1073741824)
            : 1073741824;

        const [result] = await db.sequelize.query(
            `INSERT INTO vv_resource (
                vv_resource_organisation,
                vv_resource_data_source_org_id,
                vv_resource_storage_limit,
                vv_resource_subscription_plan,
                vv_resource_user_limit,
                vv_resource_access_period_start_date,
                vv_resource_access_period_end_date,
                vv_resource_created_by,
                vv_resource_created_at,
                vv_resource_is_deleted
            ) VALUES (
                :orgId,
                :dataSourceOrgId,
                :storageLimit,
                :subscriptionPlan,
                :userLimit,
                :accessStart,
                :accessEnd,
                :createdBy,
                NOW(),
                false
            ) RETURNING vv_resource_id AS id`,
            {
                replacements: {
                    orgId: organisationId,
                    dataSourceOrgId: dataSourceOrgId || null,
                    storageLimit: storageLimitBytes,
                    subscriptionPlan: subscriptionPlan || 'Starter',
                    userLimit: userLimit || 50,
                    accessStart,
                    accessEnd,
                    createdBy: req.user.id || 1
                },
                type: db.sequelize.QueryTypes.INSERT
            }
        );

        const newId = result[0].id;

        return respond.ok(res, {
            id: newId,
            organisationId,
            organisationName: orgCheck[0].vv_organization_name,
            dataSourceOrgId: dataSourceOrgId || null,
            storageLimit: storageLimitBytes,
            storageLimitGB: (storageLimitBytes / 1073741824).toFixed(2) + ' GB',
            subscriptionPlan: subscriptionPlan || 'Starter',
            userLimit: userLimit || 50,
            accessStart,
            accessEnd
        }, 'Resource created successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/dashboard/resources/:id
 * @desc    Update an existing resource allocation record
 */
router.put('/resources/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            organisationId,
            dataSourceOrgId,
            storageLimitGB,
            subscriptionPlan,
            userLimit,
            accessStart,
            accessEnd
        } = req.body;

        if (!organisationId || !accessStart || !accessEnd) {
            return respond.badReq(res, 'organisationId, accessStart, and accessEnd are required');
        }

        // Check record exists
        const existing = await db.sequelize.query(
            `SELECT vv_resource_id FROM vv_resource WHERE vv_resource_id = :id AND vv_resource_is_deleted IS NOT TRUE LIMIT 1`,
            {
                replacements: { id },
                type: db.sequelize.QueryTypes.SELECT
            }
        );
        if (existing.length === 0) {
            return respond.notFound(res, 'Resource record not found');
        }

        // Validate organization exists
        const orgCheck = await db.sequelize.query(
            `SELECT vv_organization_id, vv_organization_name FROM vv_organization WHERE vv_organization_id = :orgId AND vv_organization_is_deleted IS NOT TRUE LIMIT 1`,
            {
                replacements: { orgId: organisationId },
                type: db.sequelize.QueryTypes.SELECT
            }
        );
        if (orgCheck.length === 0) {
            return respond.badReq(res, 'Organization not found');
        }

        const storageLimitBytes = storageLimitGB
            ? Math.round(parseFloat(storageLimitGB) * 1073741824)
            : 1073741824;

        await db.sequelize.query(
            `UPDATE vv_resource SET
                vv_resource_organisation             = :orgId,
                vv_resource_data_source_org_id       = :dataSourceOrgId,
                vv_resource_storage_limit            = :storageLimit,
                vv_resource_subscription_plan        = :subscriptionPlan,
                vv_resource_user_limit               = :userLimit,
                vv_resource_access_period_start_date = :accessStart,
                vv_resource_access_period_end_date   = :accessEnd,
                vv_resource_updated_by               = :updatedBy,
                vv_resource_updated_at               = NOW()
             WHERE vv_resource_id = :id AND vv_resource_is_deleted IS NOT TRUE`,
            {
                replacements: {
                    orgId: organisationId,
                    dataSourceOrgId: dataSourceOrgId || null,
                    storageLimit: storageLimitBytes,
                    subscriptionPlan: subscriptionPlan || 'Starter',
                    userLimit: userLimit || 50,
                    accessStart,
                    accessEnd,
                    updatedBy: req.user.id || 1,
                    id
                },
                type: db.sequelize.QueryTypes.UPDATE
            }
        );

        return respond.ok(res, {
            id: Number(id),
            organisationId,
            organisationName: orgCheck[0].vv_organization_name,
            dataSourceOrgId: dataSourceOrgId || null,
            storageLimit: storageLimitBytes,
            storageLimitGB: (storageLimitBytes / 1073741824).toFixed(2) + ' GB',
            subscriptionPlan: subscriptionPlan || 'Starter',
            userLimit: userLimit || 50,
            accessStart,
            accessEnd
        }, 'Resource updated successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/dashboard/resources/:id
 * @desc    Soft delete a resource allocation record
 */
router.delete('/resources/:id', authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = await db.sequelize.query(
            `SELECT vv_resource_id FROM vv_resource WHERE vv_resource_id = :id AND vv_resource_is_deleted IS NOT TRUE LIMIT 1`,
            {
                replacements: { id },
                type: db.sequelize.QueryTypes.SELECT
            }
        );
        if (existing.length === 0) {
            return respond.notFound(res, 'Resource record not found');
        }

        await db.sequelize.query(
            `UPDATE vv_resource SET
                vv_resource_is_deleted  = true,
                vv_resource_deleted_at  = NOW(),
                vv_resource_deleted_by  = :deletedBy
             WHERE vv_resource_id = :id`,
            {
                replacements: {
                    deletedBy: req.user.id || 1,
                    id
                },
                type: db.sequelize.QueryTypes.UPDATE
            }
        );

        return respond.ok(res, null, 'Resource deleted successfully');
    } catch (error) {
        next(error);
    }
});

export default router;

