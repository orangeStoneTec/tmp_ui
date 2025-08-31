// 导入数据库连接和所有模型
const sequelize = require('../config/database');
const User = require('./User');
const Hospital = require('./Hospital');
const Department = require('./Department');
const Project = require('./Project');
const Certification = require('./Certification');
const ProjectMember = require('./ProjectMember');
const UserProfile = require('./UserProfile');

// 定义模型关系
function setupAssociations() {
    // User 关系
    User.hasOne(UserProfile, { foreignKey: 'user_id', as: 'profile' });
    User.hasMany(Project, { foreignKey: 'leader_id', as: 'ledProjects' });
    User.hasMany(ProjectMember, { foreignKey: 'user_id', as: 'projectMemberships' });
    User.hasMany(Certification, { foreignKey: 'user_id', as: 'certifications' });

    // Hospital 关系
    Hospital.hasMany(Department, { foreignKey: 'hospital_id', as: 'departments' });
    Hospital.hasMany(UserProfile, { foreignKey: 'hospital_id', as: 'userProfiles' });
    Hospital.hasMany(Certification, { foreignKey: 'hospital_id', as: 'certifications' });

    // Department 关系
    Department.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });
    Department.hasMany(UserProfile, { foreignKey: 'department_id', as: 'userProfiles' });
    Department.hasMany(Certification, { foreignKey: 'department_id', as: 'certifications' });

    // Project 关系
    Project.belongsTo(User, { foreignKey: 'leader_id', as: 'leader' });
    Project.hasMany(ProjectMember, { foreignKey: 'project_id', as: 'members' });
    
    // 通过UserProfile获取项目所属医院和科室
    Project.belongsTo(Hospital, { 
        through: UserProfile,
        foreignKey: 'leader_id',
        otherKey: 'hospital_id',
        as: 'hospital'
    });
    
    Project.belongsTo(Department, { 
        through: UserProfile,
        foreignKey: 'leader_id',
        otherKey: 'department_id',
        as: 'department'
    });

    // ProjectMember 关系
    ProjectMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    ProjectMember.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

    // UserProfile 关系
    UserProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    UserProfile.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });
    UserProfile.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });

    // Certification 关系
    Certification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    Certification.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });
    Certification.belongsTo(Department, { foreignKey: 'department_id', as: 'department' });
    Certification.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });
}

// 设置关系
setupAssociations();

// 导出所有模型
module.exports = {
    sequelize,
    User,
    Hospital,
    Department,
    Project,
    Certification,
    ProjectMember,
    UserProfile,
    setupAssociations
};