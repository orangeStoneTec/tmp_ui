// 管理后台 API 服务
class AdminAPIService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('adminToken');
    }

    // 设置认证token
    setToken(token) {
        this.token = token;
        localStorage.setItem('adminToken', token);
    }

    // 清除token
    clearToken() {
        this.token = null;
        localStorage.removeItem('adminToken');
    }

    // 通用请求方法
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                this.clearToken();
                throw new Error('认证失败，请重新登录');
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `请求失败: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API请求失败:', error);
            throw error;
        }
    }

    // GET请求
    async get(endpoint, params = {}) {
        const url = new URL(`${this.baseURL}${endpoint}`);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
                url.searchParams.append(key, params[key]);
            }
        });

        return this.request(url.toString().replace(this.baseURL, ''), {
            method: 'GET'
        });
    }

    // POST请求
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT请求
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE请求
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }

    // ============ 仪表盘相关 API ============
    async getDashboard() {
        return this.get('/admin/dashboard');
    }

    async getSystemStats() {
        return this.get('/admin/stats');
    }

    // ============ 用户管理相关 API ============
    async getUsers(params = {}) {
        return this.get('/admin/users', params);
    }

    async getUserById(id) {
        return this.get(`/admin/users/${id}`);
    }

    async updateUserStatus(id, status) {
        return this.put(`/admin/users/${id}/status`, { status });
    }

    // ============ 认证审核相关 API ============
    async getCertifications(params = {}) {
        return this.get('/admin/certifications', params);
    }

    async reviewCertification(id, status, reviewNote = '') {
        return this.put(`/admin/certifications/${id}/review`, {
            status,
            review_note: reviewNote
        });
    }

    // ============ 项目管理相关 API ============
    async getProjects(params = {}) {
        return this.get('/admin/projects', params);
    }

    async updateProjectStatus(id, status) {
        return this.put(`/admin/projects/${id}/status`, { status });
    }

    async getProjectById(id) {
        return this.get(`/projects/${id}`);
    }

    // ============ 医院管理相关 API ============
    async getHospitals(params = {}) {
        return this.get('/admin/hospitals', params);
    }

    async createHospital(data) {
        return this.post('/hospitals', data);
    }

    async updateHospital(id, data) {
        return this.put(`/hospitals/${id}`, data);
    }

    async deleteHospital(id) {
        return this.delete(`/hospitals/${id}`);
    }

    async updateHospitalStatus(id, status) {
        return this.put(`/admin/hospitals/${id}/status`, { status });
    }

    // ============ 科室管理相关 API ============
    async getDepartments(params = {}) {
        return this.get('/admin/departments', params);
    }

    async createDepartment(data) {
        return this.post('/departments', data);
    }

    async updateDepartment(id, data) {
        return this.put(`/departments/${id}`, data);
    }

    async deleteDepartment(id) {
        return this.delete(`/departments/${id}`);
    }

    async getDepartmentStats() {
        return this.get('/departments/stats');
    }

    // ============ 认证相关 API ============
    async login(credentials) {
        const response = await this.post('/auth/login', credentials);
        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }
        return response;
    }

    async getCurrentUser() {
        return this.get('/auth/me');
    }

    async logout() {
        this.clearToken();
        // 可以调用后端的注销接口
        return { success: true };
    }

    // ============ 文件上传相关 API ============
    async uploadFile(file, type = 'image') {
        const formData = new FormData();
        formData.append(type, file);

        const headers = {};
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${this.baseURL}/upload/${type}`, {
                method: 'POST',
                headers,
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || '文件上传失败');
            }

            return await response.json();
        } catch (error) {
            console.error('文件上传失败:', error);
            throw error;
        }
    }

    // ============ 数据导出相关 ============
    async exportData(type, params = {}) {
        const url = new URL(`${this.baseURL}/admin/export/${type}`);
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.append(key, params[key]);
            }
        });

        const headers = {};
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                throw new Error('导出失败');
            }

            // 处理文件下载
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${type}_export_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

            return { success: true };
        } catch (error) {
            console.error('数据导出失败:', error);
            throw error;
        }
    }

    // ============ 批量操作相关 ============
    async batchOperation(type, operation, ids, data = {}) {
        return this.post(`/admin/batch/${type}/${operation}`, {
            ids,
            ...data
        });
    }

    // 批量审核认证
    async batchReviewCertifications(ids, status, reviewNote = '') {
        return this.batchOperation('certifications', 'review', ids, {
            status,
            review_note: reviewNote
        });
    }

    // 批量更新用户状态
    async batchUpdateUserStatus(ids, status) {
        return this.batchOperation('users', 'status', ids, { status });
    }

    // ============ 搜索相关 ============
    async globalSearch(query) {
        return this.get('/admin/search', { q: query });
    }

    // ============ 系统日志相关 ============
    async getSystemLogs(params = {}) {
        return this.get('/admin/logs', params);
    }
}

// 创建全局实例
const adminAPI = new AdminAPIService();

// 导出到全局
window.adminAPI = adminAPI;

// 模拟数据服务（用于开发阶段）
class MockAdminAPIService extends AdminAPIService {
    constructor() {
        super();
        this.mockData = this.generateMockData();
    }

    generateMockData() {
        return {
            dashboard: {
                pendingCertifications: 12,
                pendingApplications: 8,
                activeGroups: 156,
                totalUsers: 2847,
                monthlyGrowth: 145
            },
            users: Array.from({ length: 50 }, (_, i) => ({
                id: i + 1,
                username: `user_${i + 1}`,
                email: `user${i + 1}@example.com`,
                real_name: `用户${i + 1}`,
                role: ['user', 'admin', 'super_admin'][i % 3],
                status: ['active', 'inactive', 'banned'][i % 3],
                created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
                last_login_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                profile: {
                    real_name: `用户${i + 1}`,
                    title: '主治医师',
                    phone: '138****' + String(i + 1000).slice(-4),
                    hospital: {
                        id: (i % 10) + 1,
                        name: `医院${(i % 10) + 1}`
                    },
                    department: {
                        id: (i % 5) + 1,
                        name: `科室${(i % 5) + 1}`
                    }
                }
            })),
            certifications: Array.from({ length: 30 }, (_, i) => ({
                id: i + 1,
                userName: `用户${i + 1}`,
                userPhone: '138****' + String(i + 1000).slice(-4),
                hospitalName: `医院${(i % 10) + 1}`,
                departmentName: `科室${(i % 5) + 1}`,
                certificateType: ['doctor', 'nurse', 'researcher'][i % 3],
                certificateNumber: `CERT${String(i + 1000)}`,
                status: ['pending', 'approved', 'rejected'][i % 3],
                submitDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                certificateImages: ['cert1.jpg', 'cert2.jpg'],
                expiryDate: '2025-12-31'
            })),
            projects: Array.from({ length: 40 }, (_, i) => ({
                id: i + 1,
                title: `研究项目${i + 1}`,
                description: `这是第${i + 1}个研究项目的描述`,
                type: ['临床研究', '基础研究', '转化研究', '教学研究', '管理研究'][i % 5],
                status: ['active', 'completed', 'paused', 'cancelled'][i % 4],
                leader: {
                    id: i + 1,
                    username: `leader${i + 1}`,
                    profile: {
                        real_name: `负责人${i + 1}`
                    }
                },
                member_count: Math.floor(Math.random() * 10) + 1,
                created_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString()
            })),
            hospitals: Array.from({ length: 20 }, (_, i) => ({
                id: i + 1,
                name: `${['北京', '上海', '广州', '深圳', '杭州'][i % 5]}${['协和', '同济', '华西', '湘雅', '齐鲁'][Math.floor(i / 5) % 5]}医院`,
                level: ['三甲', '三乙', '二甲', '二乙'][i % 4],
                type: ['综合医院', '专科医院', '中医医院', '妇幼保健院'][i % 4],
                location: ['北京市', '上海市', '广州市', '深圳市', '杭州市'][i % 5],
                department_count: Math.floor(Math.random() * 50) + 10,
                user_count: Math.floor(Math.random() * 500) + 50,
                status: ['active', 'inactive'][i % 2],
                created_at: new Date(Date.now() - Math.random() * 1000 * 24 * 60 * 60 * 1000).toISOString()
            })),
            departments: Array.from({ length: 35 }, (_, i) => ({
                id: i + 1,
                name: ['内科', '外科', '儿科', '妇产科', '神经科', '心脏科', '肿瘤科'][i % 7],
                hospital_id: (i % 20) + 1,
                hospital_name: `医院${(i % 20) + 1}`,
                director: `主任${i + 1}`,
                user_count: Math.floor(Math.random() * 50) + 5,
                status: ['active', 'inactive'][i % 2],
                created_at: new Date(Date.now() - Math.random() * 800 * 24 * 60 * 60 * 1000).toISOString()
            }))
        };
    }

    // 模拟分页和筛选
    async get(endpoint, params = {}) {
        // 解析endpoint获取资源类型
        const pathParts = endpoint.split('/');
        let resource = pathParts[pathParts.length - 1];

        // 如果是仪表盘
        if (endpoint.includes('/admin/dashboard')) {
            return {
                success: true,
                data: this.mockData.dashboard
            };
        }

        // 如果是统计
        if (endpoint.includes('/admin/stats')) {
            return {
                success: true,
                data: {
                    total_count: this.mockData.users.length,
                    by_role: [
                        { role: 'user', count: 40 },
                        { role: 'admin', count: 8 },
                        { role: 'super_admin', count: 2 }
                    ]
                }
            };
        }

        // 获取对应的模拟数据
        let data = [];
        if (endpoint.includes('users')) {
            data = this.mockData.users;
            resource = 'users';
        } else if (endpoint.includes('certifications')) {
            data = this.mockData.certifications;
            resource = 'certifications';
        } else if (endpoint.includes('projects')) {
            data = this.mockData.projects;
            resource = 'projects';
        } else if (endpoint.includes('hospitals')) {
            data = this.mockData.hospitals;
            resource = 'hospitals';
        } else if (endpoint.includes('departments')) {
            data = this.mockData.departments;
            resource = 'departments';
        }

        // 应用筛选
        let filteredData = [...data];

        if (params.search) {
            filteredData = filteredData.filter(item =>
                Object.values(item).some(value =>
                    String(value).toLowerCase().includes(params.search.toLowerCase())
                )
            );
        }

        if (params.status) {
            filteredData = filteredData.filter(item => item.status === params.status);
        }

        if (params.type) {
            filteredData = filteredData.filter(item => item.type === params.type);
        }

        if (params.role) {
            filteredData = filteredData.filter(item => item.role === params.role);
        }

        // 应用分页
        const page = parseInt(params.page) || 1;
        const limit = parseInt(params.limit) || 10;
        const offset = (page - 1) * limit;
        const paginatedData = filteredData.slice(offset, offset + limit);

        return {
            success: true,
            data: {
                [resource]: paginatedData,
                pagination: {
                    current_page: page,
                    total_pages: Math.ceil(filteredData.length / limit),
                    total_count: filteredData.length,
                    per_page: limit
                }
            }
        };
    }

    // 模拟其他操作
    async post(endpoint, data) {
        return { success: true, message: '操作成功', data: { id: Date.now() } };
    }

    async put(endpoint, data) {
        return { success: true, message: '更新成功' };
    }

    async delete(endpoint) {
        return { success: true, message: '删除成功' };
    }
}

// 在开发环境使用模拟服务
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.adminAPI = new MockAdminAPIService();
    console.log('使用模拟数据服务进行开发');
}