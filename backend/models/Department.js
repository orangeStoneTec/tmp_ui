const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Department = sequelize.define('Department', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    description: {
        type: DataTypes.TEXT
    },
    director: {
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
    specialties: {
        type: DataTypes.JSON, // 专业方向标签数组
        defaultValue: []
    },
    research_directions: {
        type: DataTypes.JSON, // 研究方向数组
        defaultValue: []
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
    tableName: 'departments'
});

module.exports = Department;