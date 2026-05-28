/**
 * VvOrganization Model 
 * Features prefix-based column names and matches the 16-column database schema.
 */
export default (sequelize, DataTypes) => {
    const VvOrganization = sequelize.define('VvOrganization', {
        vv_organization_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        vv_organization_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        vv_organization_code: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        vv_organization_type: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        vv_organization_country: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        vv_organization_status: {
            type: DataTypes.STRING(50),
            defaultValue: 'Active',
            allowNull: true
        },
        vv_organization_created_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        vv_organization_created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: true
        },
        vv_organization_updated_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        vv_organization_updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        vv_organization_deleted_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        vv_organization_deleted_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        vv_organization_is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true
        },
        vv_organization_logo: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        vv_organization_privacy_policy: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        vv_organization_terms_and_conditions: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        tableName: 'vv_organization',
        timestamps: false,
        underscored: false
    });

    VvOrganization.associate = (models) => {
        console.log('[Model] VvOrganization association hook loaded');
    };

    return VvOrganization;
};
