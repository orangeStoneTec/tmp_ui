const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const {
    validateProjectCreation,
    validateProjectUpdate,
    validatePagination,
    validateId
} = require('../middleware/validation');

/**
 * @route   GET /api/projects
 * @desc    获取课题列表
 * @access  Public
 */
router.get('/', [
    validatePagination,
    optionalAuth
], projectController.getProjects);

/**
 * @route   GET /api/projects/my
 * @desc    获取我的课题列表
 * @access  Private
 */
router.get('/my', [
    authenticateToken,
    validatePagination
], projectController.getMyProjects);

/**
 * @route   GET /api/projects/stats
 * @desc    获取课题统计信息
 * @access  Public
 */
router.get('/stats', projectController.getProjectStats);

/**
 * @route   GET /api/projects/:id
 * @desc    获取课题详情
 * @access  Public
 */
router.get('/:id', [
    validateId,
    optionalAuth
], projectController.getProjectById);

/**
 * @route   POST /api/projects
 * @desc    创建课题
 * @access  Private
 */
router.post('/', [
    authenticateToken,
    validateProjectCreation
], projectController.createProject);

/**
 * @route   PUT /api/projects/:id
 * @desc    更新课题信息
 * @access  Private (仅课题负责人和管理员)
 */
router.put('/:id', [
    authenticateToken,
    validateId,
    validateProjectUpdate
], projectController.updateProject);

/**
 * @route   DELETE /api/projects/:id
 * @desc    删除课题
 * @access  Private (仅课题负责人和管理员)
 */
router.delete('/:id', [
    authenticateToken,
    validateId
], projectController.deleteProject);

/**
 * @route   POST /api/projects/:id/members
 * @desc    添加课题成员
 * @access  Private (仅课题负责人)
 */
router.post('/:id/members', [
    authenticateToken,
    validateId
], projectController.addProjectMember);

/**
 * @route   DELETE /api/projects/:id/members/:user_id
 * @desc    移除课题成员
 * @access  Private (仅课题负责人)
 */
router.delete('/:id/members/:user_id', [
    authenticateToken,
    validateId
], projectController.removeProjectMember);

module.exports = router;