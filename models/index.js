'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const useSSL = String(process.env.DB_SSL).toLowerCase() === 'true';

let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: useSSL
      ? {
          ssl: { require: true, rejectUnauthorized: false },
          keepAlive: true,
          keepAliveInitialDelayMillis: 0
        }
      : {},
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
      evict: 1000
    },
    retry: {
      max: 5,
      match: [/ECONNRESET/, /ENOTFOUND/, /ECONNREFUSED/, /ETIMEDOUT/, /EHOSTUNREACH/]
    }
  });
} else {
  const env = process.env.NODE_ENV || 'development';
  const config = require('../config/database')[env];
  sequelize = config.url
    ? new Sequelize(config.url, { ...config, logging: false })
    : new Sequelize(config.database, config.username, config.password, { ...config, logging: false });
}

const db = {};

// cargar modelos
fs.readdirSync(__dirname)
  .filter(file => file !== 'index.js' && file.endsWith('.js'))
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// asociaciones
Object.values(db).forEach(model => {
  if (typeof model.associate === 'function') model.associate(db);
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
