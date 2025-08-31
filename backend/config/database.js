const { Sequelize } = require('sequelize');
const path = require('path');
const logger = require('../utils/logger');

// 数据库配置
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_PATH || path.join(__dirname, '../database/app.db'),
    logging: process.env.NODE_ENV === 'development' ? 
        (msg) => logger.debug(`[DB] ${msg}`) : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
    }
});

module.exports = sequelize;