const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
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
            len: [2, 50]
        }
    },
    phone: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
            is: /^1[3-9]\d{9}$/
        }
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('user', 'admin', 'super_admin'),
        defaultValue: 'user'
    },
    title: {
        type: DataTypes.STRING,
        defaultValue: '用户'
    },
    avatar_url: {
        type: DataTypes.STRING
    },
    certification_status: {
        type: DataTypes.ENUM('unverified', 'pending', 'verified', 'rejected'),
        defaultValue: 'unverified'
    },
    certification_date: {
        type: DataTypes.DATE
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    last_login: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'users',
    hooks: {
        beforeCreate: async (user) => {
            if (user.password_hash) {
                user.password_hash = await bcrypt.hash(user.password_hash, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password_hash')) {
                user.password_hash = await bcrypt.hash(user.password_hash, 10);
            }
        }
    }
});

// 实例方法
User.prototype.validatePassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
};

User.prototype.toSafeObject = function() {
    const { password_hash, ...safeUser } = this.toJSON();
    return safeUser;
};

module.exports = User;