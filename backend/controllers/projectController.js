const { Project, User, UserProfile, Hospital, Department, ProjectMember, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// 获取课题列表
const getProjects = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            type = '',
            status = 'active',
            hospital_id = '',
            department_id = '',
            sort_by = 'start_date',
            sort_order = 'DESC'
        } = req.query;

        const offset = (page - 1) * parseInt(limit);

        // 构建查询条件
        const whereClause = {};
        
        if (status !== 'all') {
            whereClause.status = status;
        }

        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { keywords: { [Op.like]: `%${search}%` } }
            ];
        }

        if (type) {
            whereClause.type = type;
        }

        // 构建包含条件用于按医院或科室筛选
        const includeConditions = [
            {
                model: User,
                as: 'leader',
                attributes: ['id', 'username', 'email'],
                include: [
                    {
                        model: UserProfile,
                        as: 'profile',
                        attributes: ['real_name', 'title', 'phone'],
                        include: [
                            {
                                model: Hospital,
                                as: 'hospital',
                                attributes: ['id', 'name'],
                                where: hospital_id ? { id: hospital_id } : undefined
                            },
                            {
                                model: Department,
                                as: 'department',
                                attributes: ['id', 'name'],
                                where: department_id ? { id: department_id } : undefined
                            }
                        ]
                    }
                ]
            },
            {
                model: ProjectMember,
                as: 'members',
                attributes: ['id', 'role', 'join_date'],
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username'],
                        include: [
                            {
                                model: UserProfile,
                                as: 'profile',
                                attributes: ['real_name']
                            }
                        ]
                    }
                ],
                required: false
            }
        ];

        // 查询课题
        const { count, rows: projects } = await Project.findAndCountAll({
            where: whereClause,
            include: includeConditions,
            order: [[sort_by, sort_order.toUpperCase()]],
            limit: parseInt(limit),
            offset,
            distinct: true
        });

        // 处理返回数据
        const projectsData = projects.map(project => {
            const projectData = project.toJSON();
            return {
                ...projectData,
                leader_name: projectData.leader?.profile?.real_name || projectData.leader?.username,
                hospital_name: projectData.leader?.profile?.hospital?.name,
                department_name: projectData.leader?.profile?.department?.name,
                member_count: projectData.members?.length || 0,
                // 不返回详细成员信息在列表中
                members: undefined,
                leader: {
                    id: projectData.leader?.id,
                    name: projectData.leader?.profile?.real_name || projectData.leader?.username,
                    title: projectData.leader?.profile?.title
                }
            };
        });

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

// 获取我的课题列表
const getMyProjects = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            status = 'all',
            role = 'all' // leader, member, all
        } = req.query;

        const offset = (page - 1) * parseInt(limit);
        const userId = req.user.id;

        let projects = [];
        let totalCount = 0;

        if (role === 'leader' || role === 'all') {
            // 我负责的课题
            const whereClause = { leader_id: userId };
            if (status !== 'all') {
                whereClause.status = status;
            }

            const leaderProjects = await Project.findAll({
                where: whereClause,
                include: [
                    {
                        model: ProjectMember,
                        as: 'members',
                        attributes: ['id'],
                        required: false
                    }
                ],
                order: [['created_at', 'DESC']]
            });

            projects = projects.concat(leaderProjects.map(p => ({
                ...p.toJSON(),
                my_role: 'leader',
                member_count: p.members?.length || 0,
                members: undefined
            })));
        }

        if (role === 'member' || role === 'all') {
            // 我参与的课题
            const memberProjects = await ProjectMember.findAll({
                where: { user_id: userId },
                include: [
                    {
                        model: Project,
                        as: 'project',
                        where: status !== 'all' ? { status } : {},
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
                        ]
                    }
                ],
                order: [['join_date', 'DESC']]
            });

            projects = projects.concat(memberProjects.map(pm => ({
                ...pm.project.toJSON(),
                my_role: 'member',
                my_member_role: pm.role,
                member_count: pm.project.members?.length || 0,
                members: undefined,
                leader: {
                    id: pm.project.leader?.id,
                    name: pm.project.leader?.profile?.real_name || pm.project.leader?.username
                }
            })));
        }

        // 去重并分页
        const uniqueProjects = projects.filter((project, index, self) => 
            index === self.findIndex(p => p.id === project.id)
        );

        totalCount = uniqueProjects.length;
        const paginatedProjects = uniqueProjects.slice(offset, offset + parseInt(limit));

        res.json({
            success: true,
            data: {
                projects: paginatedProjects,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: Math.ceil(totalCount / limit),
                    total_count: totalCount,
                    per_page: parseInt(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// 获取课题详情
const getProjectById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const project = await Project.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'leader',
                    attributes: ['id', 'username', 'email'],
                    include: [
                        {
                            model: UserProfile,
                            as: 'profile',
                            attributes: ['real_name', 'title', 'phone']
                        }
                    ]
                },
                {
                    model: ProjectMember,
                    as: 'members',
                    attributes: ['id', 'role', 'join_date'],
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'username', 'email'],
                            include: [
                                {
                                    model: UserProfile,
                                    as: 'profile',
                                    attributes: ['real_name', 'title', 'phone']
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: '课题不存在'
            });
        }

        // 如果不是管理员，只能查看公开状态的课题
        if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
            if (project.status !== 'active') {
                return res.status(404).json({
                    success: false,
                    message: '课题不存在'
                });
            }
        }

        const projectData = project.toJSON();

        // 格式化成员信息
        const formattedMembers = projectData.members?.map(member => ({
            id: member.id,
            role: member.role,
            join_date: member.join_date,
            user: {
                id: member.user.id,
                username: member.user.username,
                email: member.user.email,
                real_name: member.user.profile?.real_name,
                title: member.user.profile?.title,
                phone: member.user.profile?.phone
            }
        })) || [];

        res.json({
            success: true,
            data: {
                project: {
                    ...projectData,
                    leader: {
                        id: projectData.leader?.id,
                        username: projectData.leader?.username,
                        email: projectData.leader?.email,
                        real_name: projectData.leader?.profile?.real_name,
                        title: projectData.leader?.profile?.title,
                        phone: projectData.leader?.profile?.phone
                    },
                    members: formattedMembers,
                    member_count: formattedMembers.length
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// 创建课题
const createProject = async (req, res, next) => {
    try {
        const projectData = {
            ...req.body,
            leader_id: req.user.id,
            status: 'active'
        };

        const project = await Project.create(projectData);

        logger.info(`用户创建课题: ${project.title} (${project.id}) - 负责人: ${req.user.username}`);

        // 获取完整信息返回
        const createdProject = await Project.findByPk(project.id, {
            include: [
                {
                    model: User,
                    as: 'leader',
                    attributes: ['id', 'username'],
                    include: [
                        {
                            model: UserProfile,
                            as: 'profile',
                            attributes: ['real_name', 'title']
                        }
                    ]
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: '课题创建成功',
            data: {
                project: createdProject
            }
        });
    } catch (error) {
        next(error);
    }
};

// 更新课题信息
const updateProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const project = await Project.findByPk(id);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                message: '课题不存在'
            });
        }

        // 检查权限：只有课题负责人或管理员可以修改
        const isAdmin = ['admin', 'super_admin'].includes(req.user.role);
        const isLeader = project.leader_id === req.user.id;

        if (!isAdmin && !isLeader) {
            return res.status(403).json({
                success: false,
                message: '没有权限修改此课题'
            });
        }

        await project.update(updateData);

        logger.info(`课题更新: ${project.title} (${project.id}) - 操作者: ${req.user.username}`);

        // 获取更新后的完整信息
        const updatedProject = await Project.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'leader',
                    attributes: ['id', 'username'],
                    include: [
                        {
                            model: UserProfile,
                            as: 'profile',
                            attributes: ['real_name', 'title']
                        }
                    ]
                }
            ]
        });

        res.json({
            success: true,
            message: '课题信息更新成功',
            data: {
                project: updatedProject
            }
        });
    } catch (error) {
        next(error);
    }
};

// 删除课题
const deleteProject = async (req, res, next) => {
    try {
        const { id } = req.params;

        const project = await Project.findByPk(id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: '课题不存在'
            });
        }

        // 检查权限：只有课题负责人或管理员可以删除
        const isAdmin = ['admin', 'super_admin'].includes(req.user.role);
        const isLeader = project.leader_id === req.user.id;

        if (!isAdmin && !isLeader) {
            return res.status(403).json({
                success: false,
                message: '没有权限删除此课题'
            });
        }

        // 删除相关的课题成员记录
        await ProjectMember.destroy({
            where: { project_id: id }
        });

        await project.destroy();

        logger.info(`课题删除: ${project.title} (${project.id}) - 操作者: ${req.user.username}`);

        res.json({
            success: true,
            message: '课题删除成功'
        });
    } catch (error) {
        next(error);
    }
};

// 添加课题成员
const addProjectMember = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { user_id, role = 'member' } = req.body;

        const project = await Project.findByPk(id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: '课题不存在'
            });
        }

        // 检查权限：只有课题负责人或管理员可以添加成员
        const isAdmin = ['admin', 'super_admin'].includes(req.user.role);
        const isLeader = project.leader_id === req.user.id;

        if (!isAdmin && !isLeader) {
            return res.status(403).json({
                success: false,
                message: '没有权限操作此课题成员'
            });
        }

        // 验证用户是否存在
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: '用户不存在'
            });
        }

        // 检查用户是否已经是课题成员
        const existingMember = await ProjectMember.findOne({
            where: { project_id: id, user_id }
        });

        if (existingMember) {
            return res.status(400).json({
                success: false,
                message: '用户已经是课题成员'
            });
        }

        // 课题负责人不能添加为成员
        if (project.leader_id === user_id) {
            return res.status(400).json({
                success: false,
                message: '课题负责人不需要添加为成员'
            });
        }

        const member = await ProjectMember.create({
            project_id: id,
            user_id,
            role
        });

        logger.info(`课题添加成员: ${project.title} (${project.id}) - 新成员: ${user.username} - 操作者: ${req.user.username}`);

        res.status(201).json({
            success: true,
            message: '成员添加成功',
            data: {
                member
            }
        });
    } catch (error) {
        next(error);
    }
};

// 移除课题成员
const removeProjectMember = async (req, res, next) => {
    try {
        const { id, user_id } = req.params;

        const project = await Project.findByPk(id);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: '课题不存在'
            });
        }

        // 检查权限：只有课题负责人或管理员可以移除成员
        const isAdmin = ['admin', 'super_admin'].includes(req.user.role);
        const isLeader = project.leader_id === req.user.id;

        if (!isAdmin && !isLeader) {
            return res.status(403).json({
                success: false,
                message: '没有权限操作此课题成员'
            });
        }

        const member = await ProjectMember.findOne({
            where: { project_id: id, user_id }
        });

        if (!member) {
            return res.status(404).json({
                success: false,
                message: '成员不存在'
            });
        }

        await member.destroy();

        logger.info(`课题移除成员: ${project.title} (${project.id}) - 移除成员ID: ${user_id} - 操作者: ${req.user.username}`);

        res.json({
            success: true,
            message: '成员移除成功'
        });
    } catch (error) {
        next(error);
    }
};

// 获取课题统计信息
const getProjectStats = async (req, res, next) => {
    try {
        // 总课题数
        const totalCount = await Project.count({
            where: { status: 'active' }
        });

        // 按类型统计
        const typeStats = await Project.findAll({
            attributes: [
                'type',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: { status: 'active' },
            group: ['type'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
        });

        // 按状态统计
        const statusStats = await Project.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status'],
            order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']]
        });

        // 最近创建的课题
        const recentProjects = await Project.findAll({
            where: { status: 'active' },
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
            attributes: ['id', 'title', 'type', 'created_at'],
            order: [['created_at', 'DESC']],
            limit: 10
        });

        res.json({
            success: true,
            data: {
                total_count: totalCount,
                by_type: typeStats,
                by_status: statusStats,
                recent_projects: recentProjects.map(p => ({
                    ...p.toJSON(),
                    leader_name: p.leader?.profile?.real_name || p.leader?.username
                }))
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProjects,
    getMyProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjectMember,
    getProjectStats
};