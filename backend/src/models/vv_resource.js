/**
 * VvResource Model
 * Represents the resource allocation plan for each organization,
 * including storage limits, subscription plan, user limits, and access period.
 * Also links to vv_data_source via vv_resource_data_source_org_id.
 */
export default (sequelize, DataTypes) => {
    const VvResource = sequelize.define('VvResource', {
        vv_resource_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        vv_resource_organisation: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'vv_organization',
                key: 'vv_organization_id'
            }
        },
        vv_resource_data_source_org_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'References vv_data_source_organization_id from vv_data_source table'
        },
        vv_resource_storage_limit: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 1073741824 // 1 GB in bytes
        },
        vv_resource_subscription_plan: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: 'Starter'
        },
        vv_resource_user_limit: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 50
        },
        vv_resource_access_period_start_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        vv_resource_access_period_end_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        vv_resource_created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        vv_resource_created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: true
        },
        vv_resource_updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        vv_resource_updated_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        vv_resource_is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true
        },
        vv_resource_deleted_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        vv_resource_deleted_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    }, {
        tableName: 'vv_resource',
        timestamps: false,
        underscored: false
    });

    VvResource.associate = (models) => {
        VvResource.belongsTo(models.VvOrganization, {
            foreignKey: 'vv_resource_organisation',
            as: 'organization'
        });
    };

    return VvResource;
};
