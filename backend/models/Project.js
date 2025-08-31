const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [6, 200]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('planning', 'recruiting', 'ongoing', 'completed', 'cancelled'),
        defaultValue: 'planning'
    },
    leader_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    budget: {
        type: DataTypes.STRING
    },
    duration: {
        type: DataTypes.STRING
    },
    requirements: {
        type: DataTypes.TEXT
    },
    contact_info: {
        type: DataTypes.STRING
    },
    tags: {
        type: DataTypes.JSON, // 研究标签数组
        defaultValue: []
    },
    member_limit: {
        type: DataTypes.INTEGER,
        defaultValue: 10
    },
    current_members: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    is_public: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    start_date: {
        type: DataTypes.DATE
    },
    end_date: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'projects'
});

module.exports = Project;