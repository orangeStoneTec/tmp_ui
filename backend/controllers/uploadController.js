const path = require('path');
const fs = require('fs');
const { getRelativePath, getFileUrl } = require('../middleware/upload');
const logger = require('../utils/logger');

// 上传单个图片
const uploadImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '没有上传文件'
            });
        }

        const file = req.file;
        const relativePath = getRelativePath(file.path);
        const fileUrl = getFileUrl(req, relativePath);

        logger.info(`用户上传图片: ${file.originalname} -> ${file.filename} - 用户: ${req.user?.username || 'anonymous'}`);

        res.json({
            success: true,
            message: '图片上传成功',
            data: {
                file: {
                    original_name: file.originalname,
                    filename: file.filename,
                    size: file.size,
                    mimetype: file.mimetype,
                    relative_path: relativePath,
                    url: fileUrl
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// 上传多个图片
const uploadImages = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: '没有上传文件'
            });
        }

        const files = req.files.map(file => {
            const relativePath = getRelativePath(file.path);
            const fileUrl = getFileUrl(req, relativePath);
            
            return {
                original_name: file.originalname,
                filename: file.filename,
                size: file.size,
                mimetype: file.mimetype,
                relative_path: relativePath,
                url: fileUrl
            };
        });

        logger.info(`用户批量上传图片: ${files.length}个文件 - 用户: ${req.user?.username || 'anonymous'}`);

        res.json({
            success: true,
            message: `成功上传${files.length}个图片`,
            data: {
                files
            }
        });
    } catch (error) {
        next(error);
    }
};

// 上传单个文档
const uploadDocument = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '没有上传文件'
            });
        }

        const file = req.file;
        const relativePath = getRelativePath(file.path);
        const fileUrl = getFileUrl(req, relativePath);

        logger.info(`用户上传文档: ${file.originalname} -> ${file.filename} - 用户: ${req.user?.username || 'anonymous'}`);

        res.json({
            success: true,
            message: '文档上传成功',
            data: {
                file: {
                    original_name: file.originalname,
                    filename: file.filename,
                    size: file.size,
                    mimetype: file.mimetype,
                    relative_path: relativePath,
                    url: fileUrl
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// 上传多个文档
const uploadDocuments = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: '没有上传文件'
            });
        }

        const files = req.files.map(file => {
            const relativePath = getRelativePath(file.path);
            const fileUrl = getFileUrl(req, relativePath);
            
            return {
                original_name: file.originalname,
                filename: file.filename,
                size: file.size,
                mimetype: file.mimetype,
                relative_path: relativePath,
                url: fileUrl
            };
        });

        logger.info(`用户批量上传文档: ${files.length}个文件 - 用户: ${req.user?.username || 'anonymous'}`);

        res.json({
            success: true,
            message: `成功上传${files.length}个文档`,
            data: {
                files
            }
        });
    } catch (error) {
        next(error);
    }
};

// 上传认证材料（头像、证件照等）
const uploadCertificationMaterial = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '没有上传文件'
            });
        }

        const file = req.file;
        const relativePath = getRelativePath(file.path);
        const fileUrl = getFileUrl(req, relativePath);

        // 验证是否为图片文件
        if (!file.mimetype.startsWith('image/')) {
            return res.status(400).json({
                success: false,
                message: '认证材料只能上传图片文件'
            });
        }

        logger.info(`用户上传认证材料: ${file.originalname} -> ${file.filename} - 用户: ${req.user?.username || 'anonymous'}`);

        res.json({
            success: true,
            message: '认证材料上传成功',
            data: {
                file: {
                    original_name: file.originalname,
                    filename: file.filename,
                    size: file.size,
                    mimetype: file.mimetype,
                    relative_path: relativePath,
                    url: fileUrl
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// 删除文件
const deleteFile = async (req, res, next) => {
    try {
        const { filename } = req.params;
        
        if (!filename) {
            return res.status(400).json({
                success: false,
                message: '文件名不能为空'
            });
        }

        // 安全检查：防止路径遍历攻击
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({
                success: false,
                message: '无效的文件名'
            });
        }

        const { deleteFile: deleteFileUtil } = require('../middleware/upload');
        
        // 尝试从各个目录删除文件
        const possiblePaths = [
            `images/${filename}`,
            `documents/${filename}`,
            `temp/${filename}`
        ];

        let deleted = false;
        for (const relativePath of possiblePaths) {
            if (deleteFileUtil(relativePath)) {
                deleted = true;
                break;
            }
        }

        if (deleted) {
            logger.info(`用户删除文件: ${filename} - 用户: ${req.user?.username || 'anonymous'}`);
            
            res.json({
                success: true,
                message: '文件删除成功'
            });
        } else {
            res.status(404).json({
                success: false,
                message: '文件不存在'
            });
        }
    } catch (error) {
        next(error);
    }
};

// 获取文件信息
const getFileInfo = async (req, res, next) => {
    try {
        const { filename } = req.params;
        
        if (!filename) {
            return res.status(400).json({
                success: false,
                message: '文件名不能为空'
            });
        }

        // 安全检查
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({
                success: false,
                message: '无效的文件名'
            });
        }

        const { uploadDir, fileExists } = require('../middleware/upload');
        
        // 尝试从各个目录查找文件
        const possiblePaths = [
            `images/${filename}`,
            `documents/${filename}`,
            `temp/${filename}`
        ];

        let fileInfo = null;
        for (const relativePath of possiblePaths) {
            if (fileExists(relativePath)) {
                const fullPath = path.join(uploadDir, relativePath);
                const stats = fs.statSync(fullPath);
                const fileUrl = getFileUrl(req, relativePath);
                
                fileInfo = {
                    filename,
                    relative_path: relativePath,
                    size: stats.size,
                    created_at: stats.birthtime,
                    modified_at: stats.mtime,
                    url: fileUrl
                };
                break;
            }
        }

        if (fileInfo) {
            res.json({
                success: true,
                data: {
                    file: fileInfo
                }
            });
        } else {
            res.status(404).json({
                success: false,
                message: '文件不存在'
            });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadImage,
    uploadImages,
    uploadDocument,
    uploadDocuments,
    uploadCertificationMaterial,
    deleteFile,
    getFileInfo
};