/**
 * Todo Model
 * Complies with Developer Guidelines & Engineering Standards
 * Used as a custom module example.
 */
export default (sequelize, DataTypes) => {
    const Todo = sequelize.define('Todo', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        }
    }, {
        tableName: 'vv_todo', // Maps to vv_todo table
        timestamps: true, // Standard timestamps are fine here
        underscored: true
    });

    Todo.associate = (models) => {
        console.log('[Model] Todo association hook loaded');
    };

    return Todo;
};
