/**
 * User Model
 * Complies with Developer Guidelines & Engineering Standards
 * Features prefix-based column names, audit logging fields, and soft deletes.
 */
export default (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        vv_user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        vv_user_name: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        vv_user_email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        vv_user_password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        vv_user_organization_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        vv_user_department_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        vv_user_role_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        vv_user_setting_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        vv_user_status: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: 'Active'
        },
        vv_user_date_of_joining: {
            type: DataTypes.DATE,
            allowNull: true
        },
        vv_user_is_deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        vv_user_google_authentication: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true
        },
        vv_user_microsoft_authentication: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: true
        },
        vv_user_created_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        vv_user_created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        vv_user_updated_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        vv_user_code: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        vv_user_phone: {
            type: DataTypes.STRING(50),
            allowNull: true
        }
    }, {
        tableName: 'vv_user',
        timestamps: false,
        underscored: false
    });

    User.associate = (models) => {
        console.log('[Model] VvUser association hook loaded');
    };

    return User;
};
