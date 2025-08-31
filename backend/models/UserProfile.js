const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserProfile = sequelize.define('UserProfile', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    hospital_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'hospitals',
            key: 'id'
        }
    },
    department_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'departments',
            key: 'id'
        }
    },
    job_title: {
        type: DataTypes.STRING
    },
    specialties: {
        type: DataTypes.JSON, // 专业领域数组
        defaultValue: []
    },
    research_interests: {
        type: DataTypes.JSON, // 研究兴趣数组
        defaultValue: []
    },
    education: {
        type: DataTypes.STRING
    },
    experience_years: {
        type: DataTypes.INTEGER
    },
    bio: {
        type: DataTypes.TEXT
    },
    publications: {
        type: DataTypes.JSON, // 发表论文数组
        defaultValue: []
    },
    achievements: {
        type: DataTypes.JSON, // 成就奖项数组
        defaultValue: []
    }
}, {
    tableName: 'user_profiles'
});

module.exports = UserProfile;