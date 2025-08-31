const { body, param, query, validationResult } = require('express-validator');

// 验证结果处理中间件
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: '请求参数验证失败',
            errors: errors.array()
        });
    }
    next();
};

// 用户注册验证
const validateUserRegistration = [
    body('name')
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
    
    body('password')
        .isLength({ min: 6, max: 50 })
        .withMessage('密码长度必须在6-50个字符之间'),
    
    body()
        .custom((value, { req }) => {
            if (!req.body.phone && !req.body.email) {
                throw new Error('手机号和邮箱至少需要填写一个');
            }
            return true;
        }),
    
    handleValidationErrors
];

// 用户登录验证
const validateUserLogin = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('用户名不能为空'),
    
    body('password')
        .notEmpty()
        .withMessage('密码不能为空'),
    
    handleValidationErrors
];

// 医院创建验证
const validateHospitalCreation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('医院名称长度必须在2-100个字符之间'),
    
    body('location')
        .trim()
        .notEmpty()
        .withMessage('地区不能为空'),
    
    body('level')
        .optional()
        .isIn(['一甲', '一乙', '二甲', '二乙', '三甲', '三乙', '其他'])
        .withMessage('医院等级不正确'),
    
    body('type')
        .optional()
        .isIn(['综合医院', '专科医院', '中医医院', '妇幼保健院', '其他'])
        .withMessage('医院类型不正确'),
    
    handleValidationErrors
];

// 科室创建验证
const validateDepartmentCreation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('科室名称长度必须在2-100个字符之间'),
    
    body('hospital_id')
        .isInt({ min: 1 })
        .withMessage('请选择有效的医院'),
    
    handleValidationErrors
];

// 课题创建验证
const validateProjectCreation = [
    body('title')
        .trim()
        .isLength({ min: 6, max: 200 })
        .withMessage('课题标题长度必须在6-200个字符之间'),
    
    body('description')
        .trim()
        .isLength({ min: 10 })
        .withMessage('课题描述至少需要10个字符'),
    
    body('type')
        .optional()
        .isIn(['临床研究', '基础研究', '转化研究', '教学研究', '管理研究', '其他'])
        .withMessage('课题类型不正确'),
    
    body('start_date')
        .optional()
        .isISO8601()
        .withMessage('开始日期格式不正确'),
    
    body('end_date')
        .optional()
        .isISO8601()
        .withMessage('结束日期格式不正确'),
    
    handleValidationErrors
];

// 课题更新验证
const validateProjectUpdate = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 6, max: 200 })
        .withMessage('课题标题长度必须在6-200个字符之间'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ min: 10 })
        .withMessage('课题描述至少需要10个字符'),
    
    body('type')
        .optional()
        .isIn(['临床研究', '基础研究', '转化研究', '教学研究', '管理研究', '其他'])
        .withMessage('课题类型不正确'),
    
    body('status')
        .optional()
        .isIn(['active', 'completed', 'paused', 'cancelled'])
        .withMessage('课题状态不正确'),
    
    body('start_date')
        .optional()
        .isISO8601()
        .withMessage('开始日期格式不正确'),
    
    body('end_date')
        .optional()
        .isISO8601()
        .withMessage('结束日期格式不正确'),
    
    handleValidationErrors
];

// 认证申请验证
const validateCertificationSubmission = [
    body('certificate_type')
        .isIn(['doctor', 'nurse', 'researcher', 'other'])
        .withMessage('证件类型不正确'),
    
    body('certificate_number')
        .trim()
        .notEmpty()
        .withMessage('证件号码不能为空'),
    
    body('hospital_name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('医院名称长度必须在2-100个字符之间'),
    
    body('department_name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('科室名称长度必须在2-100个字符之间'),
    
    handleValidationErrors
];

// 分页参数验证
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('页码必须是大于0的整数'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('每页数量必须在1-100之间'),
    
    handleValidationErrors
];

// ID参数验证
const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID必须是大于0的整数'),
    
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateUserRegistration,
    validateUserLogin,
    validateHospitalCreation,
    validateDepartmentCreation,
    validateProjectCreation,
    validateProjectUpdate,
    validateCertificationSubmission,
    validatePagination,
    validateId
};