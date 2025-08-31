require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// 导入配置和工具
const db = require('./config/database');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const hospitalRoutes = require('./routes/hospitals');
const departmentRoutes = require('./routes/departments');
const projectRoutes = require('./routes/projects');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

// CORS配置
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 速率限制
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 1000, // 限制每个IP最多1000个请求
    message: {
        error: '请求过于频繁，请稍后再试',
        retryAfter: '15分钟'
    }
});
app.use(limiter);

// API健康检查
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV
    });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// API文档路由
app.get('/api/docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'api.html'));
});

// 404处理
app.use(notFound);

// 错误处理
app.use(errorHandler);

// 数据库连接和服务器启动
async function startServer() {
    try {
        // 测试数据库连接
        await db.authenticate();
        logger.info('数据库连接成功');

        // 同步数据库模型（开发环境）
        if (process.env.NODE_ENV === 'development') {
            await db.sync({ alter: true });
            logger.info('数据库同步完成');
        }

        // 启动服务器
        const server = app.listen(PORT, () => {
            logger.info(`🚀 服务器启动成功`);
            logger.info(`📍 端口: ${PORT}`);
            logger.info(`🌍 环境: ${process.env.NODE_ENV}`);
            logger.info(`📚 API文档: http://localhost:${PORT}/api/docs`);
            logger.info(`💚 健康检查: http://localhost:${PORT}/api/health`);
        });

        // 优雅关闭
        process.on('SIGTERM', () => {
            logger.info('接收到SIGTERM信号，正在关闭服务器...');
            server.close(() => {
                logger.info('服务器已关闭');
                db.close();
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            logger.info('接收到SIGINT信号，正在关闭服务器...');
            server.close(() => {
                logger.info('服务器已关闭');
                db.close();
                process.exit(0);
            });
        });

    } catch (error) {
        logger.error('服务器启动失败:', error);
        process.exit(1);
    }
}

// 未捕获异常处理
process.on('uncaughtException', (error) => {
    logger.error('未捕获的异常:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('未处理的Promise拒绝:', reason);
    process.exit(1);
});

// 启动服务器
startServer();

module.exports = app;