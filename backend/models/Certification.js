const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Certification = sequelize.define('Certification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    certificate_type: {
        type: DataTypes.ENUM('doctor', 'nurse', 'researcher', 'other'),
        allowNull: false
    },
    certificate_number: {
        type: DataTypes.STRING,
        allowNull: false
    },
    certificate_images: {
        type: DataTypes.JSON, // 证件图片URL数组
        defaultValue: []
    },
    hospital_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    department_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    expiry_date: {
        type: DataTypes.DATE
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'need_more'),
        defaultValue: 'pending'
    },
    review_comment: {
        type: DataTypes.TEXT
    },
    reviewer_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    review_date: {
        type: DataTypes.DATE
    },
    ocr_result: {
        type: DataTypes.JSON // OCR识别结果
    }
}, {
    tableName: 'certifications'
});

module.exports = Certification;