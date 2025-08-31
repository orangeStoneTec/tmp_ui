const logger = require('../utils/logger');

const errorHandler = (error, req, res, next) => {
    logger.error(`错误发生在 ${req.method} ${req.path}:`, {
        error: error.message,
        stack: error.stack,
        body: req.body,
        user: req.user?.id
    });

    // Sequelize验证错误
    if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => ({
            field: err.path,
            message: err.message
        }));
        
        return res.status(400).json({
            success: false,
            message: '数据验证失败',
            errors
        });
    }

    // Sequelize唯一约束错误
    if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors[0]?.path;
        return res.status(409).json({
            success: false,
            message: `${field}已存在`,
            field
        });
    }

    // JWT错误
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: '无效的访问令牌'
        });
    }

    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: '访问令牌已过期'
        });
    }

    // 文件上传错误
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: '文件太大，最大支持5MB'
        });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(413).json({
            success: false,
            message: '文件数量超过限制'
        });
    }

    // 自定义应用错误
    if (error.isOperational) {
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message
        });
    }

    // 默认服务器错误
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' 
            ? error.message 
            : '服务器内部错误'
    });
};

module.exports = errorHandler;