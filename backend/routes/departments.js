const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const {
    validateDepartmentCreation,
    validatePagination,
    validateId
} = require('../middleware/validation');

/**
 * @route   GET /api/departments
 * @desc    获取科室列表
 * @access  Public
 */
router.get('/', [
    validatePagination,
    optionalAuth
], departmentController.getDepartments);

/**
 * @route   GET /api/departments/stats
 * @desc    获取科室统计信息
 * @access  Public
 */
router.get('/stats', departmentController.getDepartmentStats);

/**
 * @route   GET /api/departments/hospital/:hospital_id
 * @desc    根据医院获取科室列表
 * @access  Public
 */
router.get('/hospital/:hospital_id', [
    validateId
], departmentController.getDepartmentsByHospital);

/**
 * @route   GET /api/departments/:id
 * @desc    获取科室详情
 * @access  Public
 */
router.get('/:id', [
    validateId,
    optionalAuth
], departmentController.getDepartmentById);

/**
 * @route   POST /api/departments
 * @desc    创建科室
 * @access  Admin
 */
router.post('/', [
    authenticateToken,
    requireAdmin,
    validateDepartmentCreation
], departmentController.createDepartment);

/**
 * @route   PUT /api/departments/:id
 * @desc    更新科室信息
 * @access  Admin
 */
router.put('/:id', [
    authenticateToken,
    requireAdmin,
    validateId,
    validateDepartmentCreation
], departmentController.updateDepartment);

/**
 * @route   DELETE /api/departments/:id
 * @desc    删除科室
 * @access  Admin
 */
router.delete('/:id', [
    authenticateToken,
    requireAdmin,
    validateId
], departmentController.deleteDepartment);

module.exports = router;