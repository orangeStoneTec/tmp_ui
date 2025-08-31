const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Hospital = sequelize.define('Hospital', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    description: {
        type: DataTypes.TEXT
    },
    level: {
        type: DataTypes.ENUM('一甲', '一乙', '二甲', '二乙', '三甲', '三乙', '其他'),
        defaultValue: '其他'
    },
    type: {
        type: DataTypes.ENUM('综合医院', '专科医院', '中医医院', '妇幼保健院', '其他'),
        defaultValue: '综合医院'
    },
    location: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING
    },
    contact_phone: {
        type: DataTypes.STRING
    },
    contact_email: {
        type: DataTypes.STRING,
        validate: {
            isEmail: true
        }
    },
    website: {
        type: DataTypes.STRING,
        validate: {
            isUrl: true
        }
    },
    license_number: {
        type: DataTypes.STRING,
        unique: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'pending'),
        defaultValue: 'pending'
    },
    submit_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'hospitals'
});

module.exports = Hospital;