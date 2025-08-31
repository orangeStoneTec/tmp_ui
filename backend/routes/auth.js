const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
    validateUserRegistration,
    validateUserLogin,
    handleValidationErrors
} = require('../middleware/validation');
const { body } = require('express-validator');

/**
 * @route   POST /api/auth/register
 * @desc    用户注册
 * @access  Public
 */
router.post('/register', validateUserRegistration, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    用户登录
 * @access  Public
 */
router.post('/login', validateUserLogin, authController.login);

/**
 * @route   POST /api/auth/admin/login
 * @desc    管理员登录
 * @access  Public
 */
router.post('/admin/login', validateUserLogin, authController.adminLogin);

/**
 * @route   GET /api/auth/me
 * @desc    获取当前用户信息
 * @access  Private
 */
router.get('/me', authenticateToken, authController.getCurrentUser);

/**
 * @route   PUT /api/auth/profile
 * @desc    更新用户资料
 * @access  Private
 */
router.put('/profile', [
    authenticateToken,
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('姓名长度必须在2-50个字符之间'),
    body('phone')
        .optional()
        .isMobilePhone('zh-CN')
        .withMessage('请输入有效的中国手机号'),
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('请输入有效的邮箱地址'),
    handleValidationErrors
], authController.updateProfile);

/**
 * @route   PUT /api/auth/password
 * @desc    修改密码
 * @access  Private
 */
router.put('/password', [
    authenticateToken,
    body('currentPassword')
        .notEmpty()
        .withMessage('请输入当前密码'),
    body('newPassword')
        .isLength({ min: 6, max: 50 })
        .withMessage('新密码长度必须在6-50个字符之间'),
    handleValidationErrors
], authController.changePassword);

/**
 * @route   POST /api/auth/refresh
 * @desc    刷新访问令牌
 * @access  Private
 */
router.post('/refresh', authenticateToken, authController.refreshToken);

module.exports = router;