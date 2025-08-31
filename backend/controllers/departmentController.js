const { Department, Hospital, UserProfile, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// 获取科室列表
const getDepartments = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            hospital_id = '',
            status = 'active'
        } = req.query;

        const offset = (page - 1) * parseInt(limit);

        // 构建查询条件
        const whereClause = {
            status: status === 'all' ? { [Op.in]: ['active', 'inactive', 'pending'] } : status
        };

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { director: { [Op.like]: `%${search}%` } }
            ];
        }

        if (hospital_id) {
            whereClause.hospital_id = hospital_id;
        }

        // 查询科室
        const { count, rows: departments } = await Department.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Hospital,
                    as: 'hospital',
                    attributes: ['id', 'name', 'level', 'type'],
                    required: true
                },
                {
                    model: UserProfile,
                    as: 'userProfiles',
                    attributes: ['id'],
                    required: false
                }
            ],
            order: [['submit_date', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        // 处理返回数据
        const departmentsWithStats = departments.map(dept => {
            const deptData = dept.toJSON();
            return {
                ...deptData,
                hospital_name: deptData.hospital?.name,
                user_count: deptData.userProfiles?.length || 0,
                userProfiles: undefined // 移除详细用户数据
            };
        });

        res.json({
            success: true,
            data: {
                departments: departmentsWithStats,
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

// 获取科室详情
const getDepartmentById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const department = await Department.findByPk(id, {
            include: [
                {
                    model: Hospital,
                    as: 'hospital',
                    attributes: ['id', 'name', 'level', 'type', 'location']
                }
            ]
        });

        if (!department) {
            return res.status(404).json({
                success: false,
                message: '科室不存在'
            });
        }

        // 如果不是管理员，只能查看激活状态的科室
        if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
            if (department.status !== 'active') {
                return res.status(404).json({
                    success: false,
                    message: '科室不存在'
                });
            }
        }

        // 获取科室成员数量
        const userCount = await UserProfile.count({
            where: { department_id: id }
        });

        const departmentData = department.toJSON();

        res.json({
            success: true,
            data: {
                department: {
                    ...departmentData,
                    hospital_name: departmentData.hospital?.name,
                    user_count: userCount
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// 根据医院获取科室
const getDepartmentsByHospital = async (req, res, next) => {
    try {
        const { hospital_id } = req.params;

        // 验证医院是否存在
        const hospital = await Hospital.findByPk(hospital_id);
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: '医院不存在'
            });
        }

        const departments = await Department.findAll({
            where: {
                hospital_id,
                status: 'active'
            },
            attributes: ['id', 'name', 'description', 'director', 'specialties'],
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            data: {
                hospital: {
                    id: hospital.id,
                    name: hospital.name
                },
                departments
            }
        });
    } catch (error) {
        next(error);
    }
};

// 创建科室（管理员）
const createDepartment = async (req, res, next) => {
    try {
        const departmentData = req.body;
        
        // 验证医院是否存在
        const hospital = await Hospital.findByPk(departmentData.hospital_id);
        if (!hospital) {
            return res.status(400).json({
                success: false,
                message: '指定的医院不存在'
            });
        }

        const department = await Department.create({
            ...departmentData,
            status: 'active' // 管理员创建的科室直接激活
        });

        logger.info(`管理员创建科室: ${department.name} (${department.id}) - ${hospital.name}`);

        // 获取完整信息返回
        const createdDepartment = await Department.findByPk(department.id, {
            include: [
                {
                    model: Hospital,
                    as: 'hospital',
                    attributes: ['id', 'name']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: '科室创建成功',
            data: {
                department: createdDepartment
            }
        });
    } catch (error) {
        next(error);
    }
};

// 更新科室信息（管理员）
const updateDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const department = await Department.findByPk(id);
        
        if (!department) {
            return res.status(404).json({
                success: false,
                message: '科室不存在'
            });
        }

        // 如果更新医院ID，验证新医院是否存在
        if (updateData.hospital_id && updateData.hospital_id !== department.hospital_id) {
            const hospital = await Hospital.findByPk(updateData.hospital_id);
            if (!hospital) {
                return res.status(400).json({
                    success: false,
                    message: '指定的医院不存在'
                });
            }
        }

        await department.update(updateData);

        logger.info(`管理员更新科室: ${department.name} (${department.id})`);

        // 获取更新后的完整信息
        const updatedDepartment = await Department.findByPk(id, {
            include: [
                {
                    model: Hospital,
                    as: 'hospital',
                    attributes: ['id', 'name']
                }
            ]
        });

        res.json({
            success: true,
            message: '科室信息更新成功',
            data: {
                department: updatedDepartment
            }
        });
    } catch (error) {
        next(error);
    }
};

// 删除科室（管理员）
const deleteDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const department = await Department.findByPk(id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: '科室不存在'
            });
        }

        // 检查是否有用户关联到该科室
        const userCount = await UserProfile.count({
            where: { department_id: id }
        });

        if (userCount > 0) {
            return res.status(400).json({
                success: false,
                message: '该科室下还有用户，无法删除'
            });
        }

        await department.destroy();

        logger.info(`管理员删除科室: ${department.name} (${department.id})`);

        res.json({
            success: true,
            message: '科室删除成功'
        });
    } catch (error) {
        next(error);
    }
};

// 获取科室统计信息
const getDepartmentStats = async (req, res, next) => {
    try {
        // 按专业方向统计（这里简化处理）
        const totalCount = await Department.count({
            where: { status: 'active' }
        });

        // 按医院统计科室数量
        const hospitalStats = await Department.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('Department.id')), 'department_count']
            ],
            include: [
                {
                    model: Hospital,
                    as: 'hospital',
                    attributes: ['id', 'name']
                }
            ],
            where: { status: 'active' },
            group: ['hospital.id'],
            order: [[sequelize.fn('COUNT', sequelize.col('Department.id')), 'DESC']]
        });

        res.json({
            success: true,
            data: {
                total_count: totalCount,
                by_hospital: hospitalStats
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDepartments,
    getDepartmentById,
    getDepartmentsByHospital,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentStats
};