const { User, UserProfile } = require('../models');
const { generateToken } = require('../utils/jwt');
const logger = require('../utils/logger');

// 用户注册
const register = async (req, res, next) => {
    try {
        const { name, phone, email, password } = req.body;

        // 检查用户是否已存在
        const existingUser = await User.findOne({
            where: {
                ...(phone && { phone }),
                ...(email && { email })
            }
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: phone && existingUser.phone === phone ? '手机号已注册' : '邮箱已注册'
            });
        }

        // 创建用户
        const user = await User.create({
            name,
            phone,
            email,
            password_hash: password // 会在模型钩子中自动加密
        });

        // 创建用户档案
        await UserProfile.create({
            user_id: user.id
        });

        // 生成JWT令牌
        const token = generateToken(user.id);

        // 更新最后登录时间
        await user.update({ last_login: new Date() });

        logger.info(`新用户注册: ${user.name} (${user.id})`);

        res.status(201).json({
            success: true,
            message: '注册成功',
            data: {
                token,
                user: user.toSafeObject()
            }
        });
    } catch (error) {
        next(error);
    }
};

// 用户登录
const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // 查找用户（支持手机号、邮箱、用户名登录）
        const user = await User.findOne({
            where: {
                $or: [
                    { phone: username },
                    { email: username },
                    { name: username }
                ]
            }
        });

        // 验证用户存在性和密码
        if (!user || !(await user.validatePassword(password))) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        // 检查账户状态
        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: '账户已被禁用'
            });
        }

        // 生成JWT令牌
        const token = generateToken(user.id);

        // 更新最后登录时间
        await user.update({ last_login: new Date() });

        logger.info(`用户登录: ${user.name} (${user.id})`);

        res.json({
            success: true,
            message: '登录成功',
            data: {
                token,
                user: user.toSafeObject(),
                isAdmin: ['admin', 'super_admin'].includes(user.role)
            }
        });
    } catch (error) {
        next(error);
    }
};

// 管理员登录
const adminLogin = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // 查找管理员用户
        const user = await User.findOne({
            where: {
                $or: [
                    { phone: username },
                    { email: username },
                    { name: username }
                ],
                role: ['admin', 'super_admin']
            }
        });

        // 验证用户和密码
        if (!user || !(await user.validatePassword(password))) {
            return res.status(401).json({
                success: false,
                message: '管理员用户名或密码错误'
            });
        }

        // 检查账户状态
        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: '管理员账户已被禁用'
            });
        }

        // 生成JWT令牌
        const token = generateToken(user.id);

        // 更新最后登录时间
        await user.update({ last_login: new Date() });

        logger.info(`管理员登录: ${user.name} (${user.id}) - ${user.role}`);

        res.json({
            success: true,
            message: '管理员登录成功',
            data: {
                token,
                user: user.toSafeObject(),
                isAdmin: true
            }
        });
    } catch (error) {
        next(error);
    }
};

// 获取当前用户信息
const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            include: [
                {
                    model: UserProfile,
                    as: 'profile',
                    include: [
                        { model: Hospital, as: 'hospital' },
                        { model: Department, as: 'department' }
                    ]
                }
            ],
            attributes: { exclude: ['password_hash'] }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        res.json({
            success: true,
            data: {
                user
            }
        });
    } catch (error) {
        next(error);
    }
};

// 更新用户信息
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone, email } = req.body;
        const userId = req.user.id;

        // 检查手机号和邮箱唯一性（排除当前用户）
        if (phone || email) {
            const existingUser = await User.findOne({
                where: {
                    id: { $ne: userId },
                    $or: [
                        ...(phone ? [{ phone }] : []),
                        ...(email ? [{ email }] : [])
                    ]
                }
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: phone && existingUser.phone === phone ? '手机号已被使用' : '邮箱已被使用'
                });
            }
        }

        // 更新用户基本信息
        await User.update(
            { name, phone, email },
            { where: { id: userId } }
        );

        // 获取更新后的用户信息
        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['password_hash'] }
        });

        logger.info(`用户更新资料: ${updatedUser.name} (${userId})`);

        res.json({
            success: true,
            message: '个人信息更新成功',
            data: {
                user: updatedUser
            }
        });
    } catch (error) {
        next(error);
    }
};

// 修改密码
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // 获取用户完整信息（包含密码哈希）
        const user = await User.findByPk(userId);

        // 验证当前密码
        if (!(await user.validatePassword(currentPassword))) {
            return res.status(400).json({
                success: false,
                message: '当前密码不正确'
            });
        }

        // 更新密码
        await user.update({ password_hash: newPassword });

        logger.info(`用户修改密码: ${user.name} (${userId})`);

        res.json({
            success: true,
            message: '密码修改成功'
        });
    } catch (error) {
        next(error);
    }
};

// 刷新令牌
const refreshToken = async (req, res, next) => {
    try {
        // 生成新的JWT令牌
        const token = generateToken(req.user.id);

        res.json({
            success: true,
            data: {
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    adminLogin,
    getCurrentUser,
    updateProfile,
    changePassword,
    refreshToken
};