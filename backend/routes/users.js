const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    获取用户列表（管理员）
 * @access  Admin
 */
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: '用户管理API开发中'
    });
});

module.exports = router;