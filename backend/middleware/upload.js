const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
const tempDir = path.join(uploadDir, 'temp');
const imageDir = path.join(uploadDir, 'images');
const documentDir = path.join(uploadDir, 'documents');

// 创建目录
[uploadDir, tempDir, imageDir, documentDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// 配置存储
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = tempDir;
        
        if (req.route.path.includes('/image')) {
            uploadPath = imageDir;
        } else if (req.route.path.includes('/document')) {
            uploadPath = documentDir;
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // 生成唯一文件名
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${Date.now()}-${uniqueSuffix}-${name}${ext}`);
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        image: /\.(jpg|jpeg|png|gif|webp)$/i,
        document: /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i
    };

    let isAllowed = false;
    
    if (req.route.path.includes('/image')) {
        isAllowed = allowedTypes.image.test(file.originalname);
    } else if (req.route.path.includes('/document')) {
        isAllowed = allowedTypes.document.test(file.originalname);
    } else {
        // 通用上传，允许所有支持的类型
        isAllowed = allowedTypes.image.test(file.originalname) || 
                   allowedTypes.document.test(file.originalname);
    }

    if (isAllowed) {
        cb(null, true);
    } else {
        cb(new Error('不支持的文件类型'), false);
    }
};

// 基本multer配置
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 5 // 最多5个文件
    }
});

// 单文件上传中间件
const uploadSingle = (fieldName = 'file') => {
    return (req, res, next) => {
        upload.single(fieldName)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: '文件大小超过限制（最大10MB）'
                    });
                } else if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({
                        success: false,
                        message: '文件数量超过限制'
                    });
                } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return res.status(400).json({
                        success: false,
                        message: '上传的字段名不正确'
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: '文件上传错误'
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message || '文件上传失败'
                });
            }
            next();
        });
    };
};

// 多文件上传中间件
const uploadMultiple = (fieldName = 'files', maxCount = 5) => {
    return (req, res, next) => {
        upload.array(fieldName, maxCount)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: '文件大小超过限制（最大10MB）'
                    });
                } else if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({
                        success: false,
                        message: `文件数量超过限制（最多${maxCount}个文件）`
                    });
                } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return res.status(400).json({
                        success: false,
                        message: '上传的字段名不正确'
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: '文件上传错误'
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message || '文件上传失败'
                });
            }
            next();
        });
    };
};

// 工具函数：获取文件的相对路径（用于存储在数据库中）
const getRelativePath = (filePath) => {
    return path.relative(uploadDir, filePath);
};

// 工具函数：获取文件的完整URL
const getFileUrl = (req, relativePath) => {
    const protocol = req.protocol;
    const host = req.get('Host');
    return `${protocol}://${host}/uploads/${relativePath}`;
};

// 工具函数：删除文件
const deleteFile = (relativePath) => {
    try {
        const fullPath = path.join(uploadDir, relativePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            return true;
        }
        return false;
    } catch (error) {
        console.error('删除文件失败:', error);
        return false;
    }
};

// 工具函数：验证文件是否存在
const fileExists = (relativePath) => {
    const fullPath = path.join(uploadDir, relativePath);
    return fs.existsSync(fullPath);
};

module.exports = {
    uploadSingle,
    uploadMultiple,
    getRelativePath,
    getFileUrl,
    deleteFile,
    fileExists,
    uploadDir
};