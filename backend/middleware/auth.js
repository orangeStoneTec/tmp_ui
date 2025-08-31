const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

// JWT认证中间件
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: '访问令牌不存在'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 查找用户
        const user = await User.findByPk(decoded.userId, {
            attributes: { exclude: ['password_hash'] }
        });

        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                message: '用户不存在或已被禁用'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        logger.error('Token验证失败:', error);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: '访问令牌已过期'
            });
        }
        
        return res.status(401).json({
            success: false,
            message: '无效的访问令牌'
        });
    }
};

// 管理员权限验证
const requireAdmin = (req, res, next) => {
    if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: '需要管理员权限'
        });
    }
    next();
};

// 超级管理员权限验证
const requireSuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({
            success: false,
            message: '需要超级管理员权限'
        });
    }
    next();
};

// 认证用户权限验证
const requireVerified = (req, res, next) => {
    if (!req.user || req.user.certification_status !== 'verified') {
        return res.status(403).json({
            success: false,
            message: '需要完成身份认证'
        });
    }
    next();
};

// 可选认证中间件（不强制登录）
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.userId, {
                attributes: { exclude: ['password_hash'] }
            });
            
            if (user && user.is_active) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // 可选认证失败时继续执行，不返回错误
        next();
    }
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireSuperAdmin,
    requireVerified,
    optionalAuth
};