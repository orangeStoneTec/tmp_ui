const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProjectMember = sequelize.define('ProjectMember', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'projects',
            key: 'id'
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    role: {
        type: DataTypes.ENUM('leader', 'member', 'observer'),
        defaultValue: 'member'
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'left'),
        defaultValue: 'pending'
    },
    join_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    leave_date: {
        type: DataTypes.DATE
    },
    contribution: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'project_members',
    indexes: [
        {
            unique: true,
            fields: ['project_id', 'user_id']
        }
    ]
});

module.exports = ProjectMember;