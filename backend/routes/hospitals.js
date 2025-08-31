const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const {
    validateHospitalCreation,
    validatePagination,
    validateId
} = require('../middleware/validation');

/**
 * @route   GET /api/hospitals
 * @desc    获取医院列表
 * @access  Public
 */
router.get('/', [
    validatePagination,
    optionalAuth
], hospitalController.getHospitals);

/**
 * @route   GET /api/hospitals/stats
 * @desc    获取医院统计信息
 * @access  Public
 */
router.get('/stats', hospitalController.getHospitalStats);

/**
 * @route   GET /api/hospitals/:id
 * @desc    获取医院详情
 * @access  Public
 */
router.get('/:id', [
    validateId,
    optionalAuth
], hospitalController.getHospitalById);

/**
 * @route   POST /api/hospitals
 * @desc    创建医院
 * @access  Admin
 */
router.post('/', [
    authenticateToken,
    requireAdmin,
    validateHospitalCreation
], hospitalController.createHospital);

/**
 * @route   PUT /api/hospitals/:id
 * @desc    更新医院信息
 * @access  Admin
 */
router.put('/:id', [
    authenticateToken,
    requireAdmin,
    validateId,
    validateHospitalCreation
], hospitalController.updateHospital);

/**
 * @route   DELETE /api/hospitals/:id
 * @desc    删除医院
 * @access  Admin
 */
router.delete('/:id', [
    authenticateToken,
    requireAdmin,
    validateId
], hospitalController.deleteHospital);

module.exports = router;