const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

/**
 * @route   POST /api/upload/image
 * @desc    上传单个图片
 * @access  Private
 */
router.post('/image', [
    authenticateToken,
    uploadSingle('image')
], uploadController.uploadImage);

/**
 * @route   POST /api/upload/images
 * @desc    上传多个图片
 * @access  Private
 */
router.post('/images', [
    authenticateToken,
    uploadMultiple('images', 5)
], uploadController.uploadImages);

/**
 * @route   POST /api/upload/document
 * @desc    上传单个文档
 * @access  Private
 */
router.post('/document', [
    authenticateToken,
    uploadSingle('document')
], uploadController.uploadDocument);

/**
 * @route   POST /api/upload/documents
 * @desc    上传多个文档
 * @access  Private
 */
router.post('/documents', [
    authenticateToken,
    uploadMultiple('documents', 3)
], uploadController.uploadDocuments);

/**
 * @route   POST /api/upload/certification
 * @desc    上传认证材料（头像、证件照等）
 * @access  Private
 */
router.post('/certification', [
    authenticateToken,
    uploadSingle('certification')
], uploadController.uploadCertificationMaterial);

/**
 * @route   DELETE /api/upload/:filename
 * @desc    删除文件
 * @access  Private
 */
router.delete('/:filename', [
    authenticateToken
], uploadController.deleteFile);

/**
 * @route   GET /api/upload/:filename
 * @desc    获取文件信息
 * @access  Public
 */
router.get('/:filename', [
    optionalAuth
], uploadController.getFileInfo);

module.exports = router;