const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
    validatePagination,
    validateId
} = require('../middleware/validation');

// 所有admin路由都需要管理员权限
router.use(authenticateToken, requireAdmin);

/**
 * @route   GET /api/admin/dashboard
 * @desc    获取管理后台仪表盘数据
 * @access  Admin
 */
router.get('/dashboard', adminController.getDashboard);

/**
 * @route   GET /api/admin/users
 * @desc    获取用户列表（管理员）
 * @access  Admin
 */
router.get('/users', [
    validatePagination
], adminController.getUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    获取用户详情（管理员）
 * @access  Admin
 */
router.get('/users/:id', [
    validateId
], adminController.getUserById);

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    更新用户状态（管理员）
 * @access  Admin
 */
router.put('/users/:id/status', [
    validateId
], adminController.updateUserStatus);

/**
 * @route   GET /api/admin/certifications
 * @desc    获取认证申请列表（管理员）
 * @access  Admin
 */
router.get('/certifications', [
    validatePagination
], adminController.getCertifications);

/**
 * @route   PUT /api/admin/certifications/:id/review
 * @desc    审核认证申请（管理员）
 * @access  Admin
 */
router.put('/certifications/:id/review', [
    validateId
], adminController.reviewCertification);

/**
 * @route   GET /api/admin/projects
 * @desc    获取所有课题列表（管理员）
 * @access  Admin
 */
router.get('/projects', [
    validatePagination
], adminController.getProjects);

/**
 * @route   PUT /api/admin/projects/:id/status
 * @desc    更新课题状态（管理员）
 * @access  Admin
 */
router.put('/projects/:id/status', [
    validateId
], adminController.updateProjectStatus);

/**
 * @route   GET /api/admin/hospitals
 * @desc    获取医院列表（管理员）
 * @access  Admin
 */
router.get('/hospitals', [
    validatePagination
], adminController.getHospitals);

/**
 * @route   PUT /api/admin/hospitals/:id/status
 * @desc    更新医院状态（管理员）
 * @access  Admin
 */
router.put('/hospitals/:id/status', [
    validateId
], adminController.updateHospitalStatus);

/**
 * @route   GET /api/admin/departments
 * @desc    获取科室列表（管理员）
 * @access  Admin
 */
router.get('/departments', [
    validatePagination
], adminController.getDepartments);

/**
 * @route   GET /api/admin/logs
 * @desc    获取系统日志（管理员）
 * @access  Admin
 */
router.get('/logs', [
    validatePagination
], adminController.getSystemLogs);

/**
 * @route   GET /api/admin/stats
 * @desc    获取系统统计信息（管理员）
 * @access  Admin
 */
router.get('/stats', adminController.getSystemStats);

module.exports = router;