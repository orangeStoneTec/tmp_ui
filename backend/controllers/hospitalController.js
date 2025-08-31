const { Hospital, Department } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// 获取医院列表
const getHospitals = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = '',
            level = '',
            type = '',
            location = '',
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
                { location: { [Op.like]: `%${search}%` } }
            ];
        }

        if (level) whereClause.level = level;
        if (type) whereClause.type = type;
        if (location) whereClause.location = { [Op.like]: `%${location}%` };

        // 查询医院
        const { count, rows: hospitals } = await Hospital.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Department,
                    as: 'departments',
                    attributes: ['id', 'name'],
                    required: false
                }
            ],
            order: [['submit_date', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        // 计算每个医院的统计信息
        const hospitalsWithStats = hospitals.map(hospital => {
            const hospitalData = hospital.toJSON();
            return {
                ...hospitalData,
                department_count: hospitalData.departments?.length || 0,
                departments: undefined // 移除完整的departments数据，只保留统计
            };
        });

        res.json({
            success: true,
            data: {
                hospitals: hospitalsWithStats,
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

// 获取医院详情
const getHospitalById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const hospital = await Hospital.findByPk(id, {
            include: [
                {
                    model: Department,
                    as: 'departments',
                    where: { status: 'active' },
                    required: false,
                    order: [['name', 'ASC']]
                }
            ]
        });

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: '医院不存在'
            });
        }

        // 如果不是管理员，只能查看激活状态的医院
        if (!req.user || !['admin', 'super_admin'].includes(req.user.role)) {
            if (hospital.status !== 'active') {
                return res.status(404).json({
                    success: false,
                    message: '医院不存在'
                });
            }
        }

        const hospitalData = hospital.toJSON();
        
        res.json({
            success: true,
            data: {
                hospital: {
                    ...hospitalData,
                    department_count: hospitalData.departments?.length || 0
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// 创建医院（管理员）
const createHospital = async (req, res, next) => {
    try {
        const hospitalData = req.body;
        
        const hospital = await Hospital.create({
            ...hospitalData,
            status: 'active' // 管理员创建的医院直接激活
        });

        logger.info(`管理员创建医院: ${hospital.name} (${hospital.id})`);

        res.status(201).json({
            success: true,
            message: '医院创建成功',
            data: {
                hospital
            }
        });
    } catch (error) {
        next(error);
    }
};

// 更新医院信息（管理员）
const updateHospital = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const hospital = await Hospital.findByPk(id);
        
        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: '医院不存在'
            });
        }

        await hospital.update(updateData);

        logger.info(`管理员更新医院: ${hospital.name} (${hospital.id})`);

        res.json({
            success: true,
            message: '医院信息更新成功',
            data: {
                hospital
            }
        });
    } catch (error) {
        next(error);
    }
};

// 删除医院（管理员）
const deleteHospital = async (req, res, next) => {
    try {
        const { id } = req.params;

        const hospital = await Hospital.findByPk(id, {
            include: [{ model: Department, as: 'departments' }]
        });

        if (!hospital) {
            return res.status(404).json({
                success: false,
                message: '医院不存在'
            });
        }

        // 检查是否有关联的科室
        if (hospital.departments && hospital.departments.length > 0) {
            return res.status(400).json({
                success: false,
                message: '该医院下还有科室，无法删除'
            });
        }

        await hospital.destroy();

        logger.info(`管理员删除医院: ${hospital.name} (${hospital.id})`);

        res.json({
            success: true,
            message: '医院删除成功'
        });
    } catch (error) {
        next(error);
    }
};

// 获取医院统计信息
const getHospitalStats = async (req, res, next) => {
    try {
        const stats = await Hospital.findAll({
            attributes: [
                'level',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: { status: 'active' },
            group: ['level']
        });

        const typeStats = await Hospital.findAll({
            attributes: [
                'type',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: { status: 'active' },
            group: ['type']
        });

        const locationStats = await Hospital.findAll({
            attributes: [
                'location',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: { status: 'active' },
            group: ['location']
        });

        res.json({
            success: true,
            data: {
                by_level: stats,
                by_type: typeStats,
                by_location: locationStats
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getHospitals,
    getHospitalById,
    createHospital,
    updateHospital,
    deleteHospital,
    getHospitalStats
};