const { User, UserProfile, Hospital, Department, Project, Certification, ProjectMember, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// 获取管理后台仪表盘数据
const getDashboard = async (req, res, next) => {
    try {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // 并发获取统计数据
        const [
            totalUsers,
            newUsersThisWeek,
            totalProjects,
            activeProjects,
            newProjectsThisWeek,
            totalCertifications,
            pendingCertifications,
            totalHospitals,
            totalDepartments
        ] = await Promise.all([
            User.count(),
            User.count({
                where: {
                    created_at: { [Op.gte]: oneWeekAgo }
                }
            }),
            Project.count(),
            Project.count({
                where: { status: 'active' }
            }),
            Project.count({
                where: {
                    created_at: { [Op.gte]: oneWeekAgo }
                }
            }),
            Certification.count(),
            Certification.count({
                where: { status: 'pending' }
            }),
            Hospital.count(),
            Department.count()
        ]);

        // 获取最近注册的用户
        const recentUsers = await User.findAll({
            include: [
                {
                    model: UserProfile,
                    as: 'profile',
                    attributes: ['real_name', 'title'],
                    include: [
                        {
                            model: Hospital,
                            as: 'hospital',
                            attributes: ['name']
                        },
                        {
                            model: Department,
                            as: 'department',
                            attributes: ['name']
                        }
                    ]
                }
            ],
            attributes: ['id', 'username', 'email', 'role', 'status', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: 10
        });

        // 获取最近创建的课题
        const recentProjects = await Project.findAll({
            include: [
                {
                    model: User,
                    as: 'leader',
                    attributes: ['username'],
                    include: [
                        {
                            model: UserProfile,
                            as: 'profile',
                            attributes: ['real_name']
                        }
                    ]
                }
            ],
            attributes: ['id', 'title', 'type', 'status', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: 10
        });

        // 获取待审核的认证申请
        const pendingCerts = await Certification.findAll({
            where: { status: 'pending' },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['username'],
                    include: [
                        {
                            model: UserProfile,
                            as: 'profile',
                            attributes: ['real_name']
                        }
                    ]
                }
            ],
            attributes: ['id', 'certificate_type', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: 5
        });

        // 按月份统计用户注册趋势
        const userRegistrationTrend = await User.findAll({
            attributes: [
                [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                created_at: { [Op.gte]: oneMonthAgo }
            },
            group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
            order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'ASC']]
        });

        res.json({
            success: true,
            data: {
                overview: {
                    total_users: totalUsers,
                    new_users_this_week: newUsersThisWeek,
                    total_projects: totalProjects,
                    active_projects: activeProjects,
                    new_projects_this_week: newProjectsThisWeek,
                    total_certifications: totalCertifications,
                    pending_certifications: pendingCertifications,
                    total_hospitals: totalHospitals,
                    total_departments: totalDepartments
                },
                recent_users: recentUsers.map(user => ({
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    real_name: user.profile?.real_name,
                    title: user.profile?.title,
                    hospital_name: user.profile?.hospital?.name,
                    department_name: user.profile?.department?.name,
                    role: user.role,
                    status: user.status,
                    created_at: user.created_at
                })),
                recent_projects: recentProjects.map(project => ({
                    id: project.id,
                    title: project.title,
                    type: project.type,
                    status: project.status,
                    leader_name: project.leader?.profile?.real_name || project.leader?.username,
                    created_at: project.created_at
                })),
                pending_certifications: pendingCerts.map(cert => ({
                    id: cert.id,
                    certificate_type: cert.certificate_type,
                    user_name: cert.user?.profile?.real_name || cert.user?.username,
                    created_at: cert.created_at
                })),
                user_registration_trend: userRegistrationTrend
            }
        });
    } catch (error) {
        next(error);
    }
};

// 获取用户列表（管理员）
const getUsers = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            role = '',
            status = '',
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = req.query;

        const offset = (page - 1) * parseInt(limit);

        // 构建查询条件
        const whereClause = {};
        
        if (role) {
            whereClause.role = role;
        }
        
        if (status) {
            whereClause.status = status;
        }

        if (search) {
            whereClause[Op.or] = [
                { username: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: users } = await User.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: UserProfile,
                    as: 'profile',
                    attributes: ['real_name', 'title', 'phone'],
                    include: [
                        {
                            model: Hospital,
                            as: 'hospital',
                            attributes: ['id', 'name']
                        },
                        {
                            model: Department,
                            as: 'department',
                            attributes: ['id', 'name']
                        }
                    ]
                }
            ],
            attributes: ['id', 'username', 'email', 'role', 'status', 'created_at', 'last_login_at'],
            order: [[sort_by, sort_order.toUpperCase()]],
            limit: parseInt(limit),
            offset
        });

        const usersData = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            real_name: user.profile?.real_name,
            title: user.profile?.title,
            phone: user.profile?.phone,
            hospital: user.profile?.hospital,
            department: user.profile?.department,
            role: user.role,
            status: user.status,
            created_at: user.created_at,
            last_login_at: user.last_login_at
        }));

        res.json({
            success: true,
            data: {
                users: usersData,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(count / limit),
                    total_count: count,
                    per_page: parseInt(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// 获取用户详情（管理员）
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            include: [
                {
                    model: UserProfile,
                    as: 'profile',
                    include: [
                        {
                            model: Hospital,
                            as: 'hospital'
                        },
                        {
                            model: Department,
                            as: 'department'
                        }
                    ]
                },
                {
                    model: Project,
                    as: 'ledProjects',
                    attributes: ['id', 'title', 'status', 'created_at']
                },
                {
                    model: ProjectMember,
                    as: 'projectMemberships',
                    include: [
                        {
                            model: Project,
                            as: 'project',
                            attributes: ['id', 'title', 'status']
                        }
                    ]
                },
                {
                    model: Certification,
                    as: 'certifications',
                    attributes: ['id', 'certificate_type', 'status', 'created_at']
                }
            ],
            attributes: { exclude: ['password'] }
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

// 更新用户状态（管理员）
const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive', 'banned'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: '无效的用户状态'
            });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }

        await user.update({ status });

        logger.info(`管理员更新用户状态: ${user.username} (${user.id}) -> ${status} - 操作者: ${req.user.username}`);

        res.json({
            success: true,
            message: '用户状态更新成功',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    status: user.status
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// 获取认证申请列表（管理员）
const getCertifications = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            status = '',
            certificate_type = '',
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = req.query;

        const offset = (page - 1) * parseInt(limit);

        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }
        if (certificate_type) {
            whereClause.certificate_type = certificate_type;
        }

        const { count, rows: certifications } = await Certification.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'email'],
                    include: [
                        {
                            model: UserProfile,
                            as: 'profile',
                            attributes: ['real_name', 'phone']
                        }
                    ]
                },
                {
                    model: Hospital,
                    as: 'hospital',
                    attributes: ['id', 'name']
                },
                {
                    model: Department,
                    as: 'department',
                    attributes: ['id', 'name']
                },
                {
                    model: User,
                    as: 'reviewer',
                    attributes: ['username'],
                    include: [
                        {
                            model: UserProfile,
                            as: 'profile',
                            attributes: ['real_name']
                        }
                    ]
                }
            ],
            order: [[sort_by, sort_order.toUpperCase()]],
            limit: parseInt(limit),
            offset
        });

        res.json({
            success: true,
            data: {
                certifications,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(count / limit),
                    total_count: count,
                    per_page: parseInt(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// 审核认证申请（管理员）
const reviewCertification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, review_note = '' } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: '无效的审核状态'
            });
        }

        const certification = await Certification.findByPk(id);
        if (!certification) {
            return res.status(404).json({
                success: false,
                message: '认证申请不存在'
            });
        }

        if (certification.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: '该认证申请已经审核过了'
            });
        }

        await certification.update({
            status,
            review_note,
            reviewer_id: req.user.id,
            reviewed_at: new Date()
        });

        logger.info(`管理员审核认证: ${certification.id} -> ${status} - 审核员: ${req.user.username}`);

        res.json({
            success: true,
            message: `认证申请${status === 'approved' ? '通过' : '拒绝'}成功`,
            data: {
                certification
            }
        });
    } catch (error) {
        next(error);
    }
};

// 获取所有课题列表（管理员）
const getProjects = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            type = '',
            status = '',
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = req.query;

        const offset = (page - 1) * parseInt(limit);

        const whereClause = {};
        if (type) {
            whereClause.type = type;
        }
        if (status) {
            whereClause.status = status;
        }
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: projects } = await Project.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'leader',
                    attributes: ['id', 'username'],
                    include: [
                        {
                            model: UserProfile,
                            as: 'profile',
                            attributes: ['real_name']
                        }
                    ]
                },
                {
                    model: ProjectMember,
                    as: 'members',
                    attributes: ['id'],
                    required: false
                }
            ],
            order: [[sort_by, sort_order.toUpperCase()]],
            limit: parseInt(limit),
            offset,
            distinct: true
        });

        const projectsData = projects.map(project => ({
            ...project.toJSON(),
            leader_name: project.leader?.profile?.real_name || project.leader?.username,
            member_count: project.members?.length || 0,
            members: undefined
        }));

        res.json({
            success: true,
            data: {
                projects: projectsData,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(count / limit),
                    total_count: count,
                    per_page: parseInt(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// 更新课题状态（管理员）
const updateProjectStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'completed', 'paused', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: '无效的课题状态'
            });
        }

        const project = await Project.findByPk(id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: '课题不存在'
            });
        }

        await project.update({ status });

        logger.info(`管理员更新课题状态: ${project.title} (${project.id}) -> ${status} - 操作者: ${req.user.username}`);

        res.json({
            success: true,
            message: '课题状态更新成功',
            data: {
                project: {
                    id: project.id,
                    title: project.title,
                    status: project.status
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// 获取医院列表（管理员）
const getHospitals = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            level = '',
            type = '',
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = req.query;

        const offset = (page - 1) * parseInt(limit);

        const whereClause = {};
        if (level) {
            whereClause.level = level;
        }
        if (type) {
            whereClause.type = type;
        }
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { location: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: hospitals } = await Hospital.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Department,
                    as: 'departments',
                    attributes: ['id'],
                    required: false
                },
                {
                    model: UserProfile,
                    as: 'userProfiles',
                    attributes: ['id'],
                    required: false
                }
            ],
            order: [[sort_by, sort_order.toUpperCase()]],
            limit: parseInt(limit),
            offset,
            distinct: true
        });

        const hospitalsData = hospitals.map(hospital => ({
            ...hospital.toJSON(),
            department_count: hospital.departments?.length || 0,
            user_count: hospital.userProfiles?.length || 0,
            departments: undefined,
            userProfiles: undefined
        }));

        res.json({
            success: true,
            data: {
                hospitals: hospitalsData,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(count / limit),
                    total_count: count,
                    per_page: parseInt(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// 更新医院状态（管理员）
const updateHospitalStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: '无效的医院状态'
            });
        }

        const hospital = await Hospital.findByPk(id);
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: '医院不存在'
            });
        }

        await hospital.update({ status });

        logger.info(`管理员更新医院状态: ${hospital.name} (${hospital.id}) -> ${status} - 操作者: ${req.user.username}`);

        res.json({
            success: true,
            message: '医院状态更新成功',
            data: {
                hospital: {
                    id: hospital.id,
                    name: hospital.name,
                    status: hospital.status
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// 获取科室列表（管理员）
const getDepartments = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            hospital_id = '',
            status = '',
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = req.query;

        const offset = (page - 1) * parseInt(limit);

        const whereClause = {};
        if (hospital_id) {
            whereClause.hospital_id = hospital_id;
        }
        if (status) {
            whereClause.status = status;
        }
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { director: { [Op.like]: `%${search}%` } }
            ];
        }

        const { count, rows: departments } = await Department.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Hospital,
                    as: 'hospital',
                    attributes: ['id', 'name']
                },
                {
                    model: UserProfile,
                    as: 'userProfiles',
                    attributes: ['id'],
                    required: false
                }
            ],
            order: [[sort_by, sort_order.toUpperCase()]],
            limit: parseInt(limit),
            offset,
            distinct: true
        });

        const departmentsData = departments.map(dept => ({
            ...dept.toJSON(),
            hospital_name: dept.hospital?.name,
            user_count: dept.userProfiles?.length || 0,
            userProfiles: undefined
        }));

        res.json({
            success: true,
            data: {
                departments: departmentsData,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(count / limit),
                    total_count: count,
                    per_page: parseInt(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// 获取系统日志（简化版，实际应该从日志文件读取）
const getSystemLogs = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 50,
            level = '',
            search = ''
        } = req.query;

        // 这里是一个模拟的日志系统，实际应该从日志文件或日志存储系统读取
        const mockLogs = [
            {
                id: 1,
                timestamp: new Date(),
                level: 'info',
                message: '用户登录成功',
                user_id: req.user.id,
                ip: req.ip
            },
            {
                id: 2,
                timestamp: new Date(Date.now() - 1000 * 60 * 5),
                level: 'warn',
                message: '认证申请待审核',
                user_id: null,
                ip: null
            }
        ];

        res.json({
            success: true,
            data: {
                logs: mockLogs,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: 1,
                    total_count: mockLogs.length,
                    per_page: parseInt(limit)
                }
            },
            message: '这是模拟日志数据，实际部署时应该连接真实的日志系统'
        });
    } catch (error) {
        next(error);
    }
};

// 获取系统统计信息
const getSystemStats = async (req, res, next) => {
    try {
        const [
            userStats,
            projectStats,
            hospitalStats,
            certificationStats
        ] = await Promise.all([
            // 用户统计
            User.findAll({
                attributes: [
                    'role',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                group: ['role']
            }),
            // 课题统计
            Project.findAll({
                attributes: [
                    'status',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                group: ['status']
            }),
            // 医院统计
            Hospital.findAll({
                attributes: [
                    'level',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                group: ['level']
            }),
            // 认证统计
            Certification.findAll({
                attributes: [
                    'status',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                group: ['status']
            })
        ]);

        res.json({
            success: true,
            data: {
                user_stats: userStats,
                project_stats: projectStats,
                hospital_stats: hospitalStats,
                certification_stats: certificationStats
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboard,
    getUsers,
    getUserById,
    updateUserStatus,
    getCertifications,
    reviewCertification,
    getProjects,
    updateProjectStatus,
    getHospitals,
    updateHospitalStatus,
    getDepartments,
    getSystemLogs,
    getSystemStats
};