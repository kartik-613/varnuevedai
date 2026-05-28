/**
 * VV_admin Model 
 * Complies with Developer Guidelines & Engineering Standards (Version 1.1.1)
 * Features prefix-based column names, audit logging fields, and soft deletes.
 */
export default (sequelize, DataTypes) => {
    const VvAdmin = sequelize.define('VvAdmin', {
        vv_admin_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        vv_admin_name: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true
        },
        vv_admin_password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        vv_admin_refresh_token: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        // Audit Fields (MANDATORY) & Status Mapping
        vv_admin_satus: {
            type: DataTypes.SMALLINT,
            defaultValue: 1, // 1 = Active, 0 = Inactive
            allowNull: false,
            field: 'vv_admin_satus' // Matches user requested exact spelling
        },
        vv_admin_created_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        vv_admin_created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        vv_admin_modified_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        vv_admin_modified_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        vv_admin_deleted_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        vv_admin_deleted_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        vv_admin_is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    }, {
        tableName: 'vv_admin', // Following user request for exact table name
        timestamps: false, // Audit fields are managed manually or via custom hooks
        underscored: false
    });

    // Support associations if needed in the future
    VvAdmin.associate = (models) => {
        console.log('[Model] VV_admin association hook loaded');
    };

    return VvAdmin;
};
