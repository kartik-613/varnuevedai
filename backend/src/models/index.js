/**
 * Sequelize Initializer & Index
 * Aggregates all model files and exports them along with the main DB instance.
 * Automatically loads all models except this file.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { Sequelize, DataTypes } from 'sequelize';
import config from '../config/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = {};

// DB Configuration (Fallback for Boilerplate setup)
const sequelize = new Sequelize(
    config.database.database || 'test_db',
    config.database.username || 'postgres',
    config.database.password || 'postgres',
    {
        host: config.database.host || 'localhost',
        port: config.database.port || 5432,
        dialect: config.database.dialect || 'postgres',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

/**
 * Dynamic Model Loader 
 * Reads all .js files in this folder (excluding index.js) and 
 * imports them into the `db` object.
 */
const files = fs.readdirSync(__dirname).filter(file => {
    return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
});

for (const file of files) {
    const modelImport = await import(path.join(`file://${__dirname}`, file));
    const model = modelImport.default(sequelize, DataTypes);
    db[model.name] = model;
}

// Support association hook on each model if it exists
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
