import express from 'express';
import db from '../models/index.js';
import authenticate from '../middlewares/auth.js';
import * as respond from '../utils/respond.js';

const router = express.Router();

/**
 * @route   GET /api/organizations
 * @desc    Get all active organizations joined with user counts and resources
 */
router.get('/', authenticate, async (req, res, next) => {
    try {
        const rows = await db.sequelize.query(
            `SELECT
                o.vv_organization_id AS id,
                o.vv_organization_name AS name,
                o.vv_organization_status AS status,
                o.vv_organization_created_at AS created_at,
                o.vv_organization_privacy_policy AS contact_person,
                o.vv_organization_terms_and_conditions AS email,
                o.vv_organization_code AS code,
                r.vv_resource_subscription_plan AS plan,
                r.vv_resource_user_limit AS user_limit,
                r.vv_resource_storage_limit AS storage_limit,
                r.vv_resource_access_period_start_date AS access_start,
                r.vv_resource_access_period_end_date AS access_end,
                COUNT(DISTINCT u.vv_user_id) FILTER (WHERE u.vv_user_is_deleted IS NOT TRUE) AS user_count
             FROM vv_organization o
             LEFT JOIN vv_resource r ON r.vv_resource_organisation = o.vv_organization_id AND r.vv_resource_is_deleted IS NOT TRUE
             LEFT JOIN vv_user u ON u.vv_user_organization_id = o.vv_organization_id
             WHERE o.vv_organization_is_deleted IS NOT TRUE
             GROUP BY o.vv_organization_id, r.vv_resource_id
             ORDER BY o.vv_organization_id DESC`,
            { type: db.sequelize.QueryTypes.SELECT }
        );

        const orgs = rows.map(row => {
            const planFormatted = row.plan 
                ? (row.plan.charAt(0).toUpperCase() + row.plan.slice(1)) 
                : 'Starter';

            return {
                id: String(row.id),
                name: row.name,
                plan: planFormatted,
                users: parseInt(row.user_count, 10) || 0,
                usage: '0%',
                expiry: row.access_end || new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
                status: row.status === 'Active' ? 'active' : 'expired',
                email: row.email || 'admin@organization.com',
                contactPerson: row.contact_person || 'Contact Person',
                createdAt: row.created_at,
                userLimit: row.user_limit || 50,
                storageLimit: row.storage_limit ? Math.round(Number(row.storage_limit) / 1073741824) : 1, // GB
                currentUsers: parseInt(row.user_count, 10) || 0,
                currentStorage: 0,
                accessFrom: row.access_start || new Date().toISOString().split('T')[0],
                accessTo: row.access_end || new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0]
            };
        });

        return res.json(orgs);
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/organizations
 * @desc    Create a new organization and initialize its resource plan
 */
router.post('/', authenticate, async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const {
            name,
            email,
            contactPerson,
            plan,
            userLimit,
            storageLimit, // in GB from form
            accessFrom,
            accessTo
        } = req.body;

        if (!name || !email) {
            await transaction.rollback();
            return respond.badReq(res, 'Organization name and email are required');
        }

        // Generate organization unique code prefix
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const code = `ORG${randomNum}`;
        const adminId = req.user.id || 1;

        // 1. Insert into vv_organization
        const [orgResult] = await db.sequelize.query(
            `INSERT INTO vv_organization (
                vv_organization_name,
                vv_organization_code,
                vv_organization_type,
                vv_organization_country,
                vv_organization_status,
                vv_organization_created_by,
                vv_organization_created_at,
                vv_organization_updated_at,
                vv_organization_is_deleted,
                vv_organization_privacy_policy,
                vv_organization_terms_and_conditions
            ) VALUES (
                :name,
                :code,
                'Corporation',
                'India',
                'Active',
                :adminId,
                NOW(),
                NOW(),
                false,
                :contactPerson,
                :email
            ) RETURNING vv_organization_id AS id`,
            {
                replacements: {
                    name: name.trim(),
                    code,
                    adminId,
                    contactPerson: contactPerson || '',
                    email: email.trim().toLowerCase()
                },
                type: db.sequelize.QueryTypes.INSERT,
                transaction
            }
        );

        const orgId = orgResult[0].id;

        // Resolve subscription plan label
        const planStr = plan ? (plan.charAt(0).toUpperCase() + plan.slice(1)) : 'Starter';
        const limitUsers = userLimit ? parseInt(userLimit, 10) : 50;
        const limitStorageGB = storageLimit ? parseFloat(storageLimit) : 1;
        const limitStorageBytes = Math.round(limitStorageGB * 1073741824); // GB to bytes

        const dateStart = accessFrom || new Date().toISOString().split('T')[0];
        const dateEnd = accessTo || new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0];

        // 2. Insert corresponding vv_resource quota plan
        await db.sequelize.query(
            `INSERT INTO vv_resource (
                vv_resource_organisation,
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
                :storageLimit,
                :planStr,
                :limitUsers,
                :dateStart,
                :dateEnd,
                :adminId,
                NOW(),
                false
            )`,
            {
                replacements: {
                    orgId,
                    storageLimit: limitStorageBytes,
                    planStr,
                    limitUsers,
                    dateStart,
                    dateEnd,
                    adminId
                },
                type: db.sequelize.QueryTypes.INSERT,
                transaction
            }
        );

        await transaction.commit();

        return res.status(201).json({
            id: String(orgId),
            name: name.trim(),
            plan: planStr,
            users: 0,
            usage: '0%',
            expiry: dateEnd,
            status: 'active',
            email: email.trim().toLowerCase(),
            contactPerson: contactPerson || '',
            createdAt: new Date().toISOString(),
            userLimit: limitUsers,
            storageLimit: limitStorageGB,
            currentUsers: 0,
            currentStorage: 0,
            accessFrom: dateStart,
            accessTo: dateEnd
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
});

/**
 * @route   PUT /api/organizations/:id
 * @desc    Update an organization and its resource plan limits
 */
router.put('/:id', authenticate, async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { id } = req.params;
        const {
            name,
            email,
            contactPerson,
            plan,
            userLimit,
            storageLimit, // in GB
            accessFrom,
            accessTo
        } = req.body;

        if (!name || !email) {
            await transaction.rollback();
            return respond.badReq(res, 'Organization name and email are required');
        }

        const adminId = req.user.id || 1;

        // Check if organization exists and is active
        const orgCheck = await db.sequelize.query(
            `SELECT vv_organization_id FROM vv_organization WHERE vv_organization_id = :id AND vv_organization_is_deleted IS NOT TRUE LIMIT 1`,
            {
                replacements: { id },
                type: db.sequelize.QueryTypes.SELECT,
                transaction
            }
        );
        if (orgCheck.length === 0) {
            await transaction.rollback();
            return respond.notFound(res, 'Organization not found');
        }

        // 1. Update organization details
        await db.sequelize.query(
            `UPDATE vv_organization SET
                vv_organization_name = :name,
                vv_organization_privacy_policy = :contactPerson,
                vv_organization_terms_and_conditions = :email,
                vv_organization_updated_at = NOW(),
                vv_organization_updated_by = :adminId
             WHERE vv_organization_id = :id`,
            {
                replacements: {
                    name: name.trim(),
                    contactPerson: contactPerson || '',
                    email: email.trim().toLowerCase(),
                    adminId,
                    id
                },
                type: db.sequelize.QueryTypes.UPDATE,
                transaction
            }
        );

        const planStr = plan ? (plan.charAt(0).toUpperCase() + plan.slice(1)) : 'Starter';
        const limitUsers = userLimit ? parseInt(userLimit, 10) : 50;
        const limitStorageGB = storageLimit ? parseFloat(storageLimit) : 1;
        const limitStorageBytes = Math.round(limitStorageGB * 1073741824);

        const dateStart = accessFrom || new Date().toISOString().split('T')[0];
        const dateEnd = accessTo || new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0];

        // 2. Check if a resource plan exists
        const resCheck = await db.sequelize.query(
            `SELECT vv_resource_id FROM vv_resource WHERE vv_resource_organisation = :id AND vv_resource_is_deleted IS NOT TRUE LIMIT 1`,
            {
                replacements: { id },
                type: db.sequelize.QueryTypes.SELECT,
                transaction
            }
        );

        if (resCheck.length > 0) {
            // Update resource plan limits
            await db.sequelize.query(
                `UPDATE vv_resource SET
                    vv_resource_storage_limit = :storageLimit,
                    vv_resource_subscription_plan = :planStr,
                    vv_resource_user_limit = :limitUsers,
                    vv_resource_access_period_start_date = :dateStart,
                    vv_resource_access_period_end_date = :dateEnd,
                    vv_resource_updated_at = NOW(),
                    vv_resource_updated_by = :adminId
                 WHERE vv_resource_organisation = :id AND vv_resource_is_deleted IS NOT TRUE`,
                {
                    replacements: {
                        storageLimit: limitStorageBytes,
                        planStr,
                        limitUsers,
                        dateStart,
                        dateEnd,
                        adminId,
                        id
                    },
                    type: db.sequelize.QueryTypes.UPDATE,
                    transaction
                }
            );
        } else {
            // Insert resource plan limits
            await db.sequelize.query(
                `INSERT INTO vv_resource (
                    vv_resource_organisation,
                    vv_resource_storage_limit,
                    vv_resource_subscription_plan,
                    vv_resource_user_limit,
                    vv_resource_access_period_start_date,
                    vv_resource_access_period_end_date,
                    vv_resource_created_by,
                    vv_resource_created_at,
                    vv_resource_is_deleted
                ) VALUES (
                    :id,
                    :storageLimit,
                    :planStr,
                    :limitUsers,
                    :dateStart,
                    :dateEnd,
                    :adminId,
                    NOW(),
                    false
                )`,
                {
                    replacements: {
                        id,
                        storageLimit: limitStorageBytes,
                        planStr,
                        limitUsers,
                        dateStart,
                        dateEnd,
                        adminId
                    },
                    type: db.sequelize.QueryTypes.INSERT,
                    transaction
                }
            );
        }

        await transaction.commit();

        return res.json({
            id: String(id),
            name: name.trim(),
            plan: planStr,
            expiry: dateEnd,
            status: 'active',
            email: email.trim().toLowerCase(),
            contactPerson: contactPerson || '',
            userLimit: limitUsers,
            storageLimit: limitStorageGB,
            accessFrom: dateStart,
            accessTo: dateEnd
        });
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
});

/**
 * @route   DELETE /api/organizations/:id
 * @desc    Soft-delete an organization and its resource plan
 */
router.delete('/:id', authenticate, async (req, res, next) => {
    const transaction = await db.sequelize.transaction();
    try {
        const { id } = req.params;
        const adminId = req.user.id || 1;

        // Check if organization exists and is active
        const orgCheck = await db.sequelize.query(
            `SELECT vv_organization_id FROM vv_organization WHERE vv_organization_id = :id AND vv_organization_is_deleted IS NOT TRUE LIMIT 1`,
            {
                replacements: { id },
                type: db.sequelize.QueryTypes.SELECT,
                transaction
            }
        );
        if (orgCheck.length === 0) {
            await transaction.rollback();
            return respond.notFound(res, 'Organization not found');
        }

        // 1. Soft delete organization
        await db.sequelize.query(
            `UPDATE vv_organization SET
                vv_organization_is_deleted = true,
                vv_organization_deleted_at = NOW(),
                vv_organization_deleted_by = :adminId
             WHERE vv_organization_id = :id`,
            {
                replacements: { adminId, id },
                type: db.sequelize.QueryTypes.UPDATE,
                transaction
            }
        );

        // 2. Soft delete resource plan
        await db.sequelize.query(
            `UPDATE vv_resource SET
                vv_resource_is_deleted = true,
                vv_resource_deleted_at = NOW(),
                vv_resource_deleted_by = :adminId
             WHERE vv_resource_organisation = :id`,
            {
                replacements: { adminId, id },
                type: db.sequelize.QueryTypes.UPDATE,
                transaction
            }
        );

        await transaction.commit();
        return respond.ok(res, null, 'Organization soft-deleted successfully');
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
});

export default router;
