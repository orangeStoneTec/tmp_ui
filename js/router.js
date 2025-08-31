// 路由管理器

class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.beforeRouteHooks = [];
        this.afterRouteHooks = [];
        this.initializeRouter();
    }

    // 初始化路由
    initializeRouter() {
        // 监听浏览器前进后退
        window.addEventListener('popstate', (e) => {
            this.handleRouteChange(window.location.hash.slice(1) || 'home', false);
        });

        // 监听导航点击
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-route]');
            if (link) {
                e.preventDefault();
                const route = link.dataset.route;
                this.navigateTo(route);
            }
        });

        // 初始路由
        const initialRoute = window.location.hash.slice(1) || 'home';
        this.handleRouteChange(initialRoute, false);
    }

    // 注册路由
    register(path, handler, options = {}) {
        this.routes.set(path, {
            handler,
            ...options
        });
    }

    // 导航到指定路由
    navigateTo(path, addToHistory = true) {
        if (addToHistory) {
            window.history.pushState(null, null, `#${path}`);
        }
        this.handleRouteChange(path, true);
    }

    // 层级导航辅助函数
    navigateToHospitalDepartments(hospitalId, hospitalName) {
        this.navigateTo(`departments?hospital=${hospitalId}&name=${encodeURIComponent(hospitalName)}`);
    }

    navigateToDepartmentProjects(hospitalId, hospitalName, departmentId, departmentName) {
        this.navigateTo(`projects?hospital=${hospitalId}&hospitalName=${encodeURIComponent(hospitalName)}&department=${departmentId}&departmentName=${encodeURIComponent(departmentName)}`);
    }

    // 解析URL参数
    parseUrlParams(url) {
        const params = {};
        const urlParts = url.split('?');
        if (urlParts.length > 1) {
            const queryString = urlParts[1];
            const pairs = queryString.split('&');
            pairs.forEach(pair => {
                const [key, value] = pair.split('=');
                params[key] = decodeURIComponent(value || '');
            });
        }
        return {
            route: urlParts[0],
            params
        };
    }

    // 处理路由变化
    async handleRouteChange(path, fromUser = false) {
        // 解析路由和参数
        const { route, params } = this.parseUrlParams(path);

        // 执行前置钩子
        for (const hook of this.beforeRouteHooks) {
            const result = await hook(route, this.currentRoute);
            if (result === false) {
                return; // 阻止路由跳转
            }
        }

        const routeHandler = this.routes.get(route);

        if (routeHandler) {
            try {
                // 更新导航状态
                this.updateNavigationState(route);

                // 执行路由处理器，传递参数
                await routeHandler.handler(params);

                this.currentRoute = route;

                // 执行后置钩子
                for (const hook of this.afterRouteHooks) {
                    await hook(route);
                }

            } catch (error) {
                console.error('路由处理错误:', error);
                this.handleRouteError(error);
            }
        } else {
            console.warn(`路由 ${route} 未找到`);
            this.navigateTo('home');
        }
    }

    // 更新导航状态
    updateNavigationState(currentPath) {
        // 更新侧边栏导航链接状态
        document.querySelectorAll('.menu-item').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.route === currentPath) {
                link.classList.add('active');
            }
        });

        // 更新页面显示状态
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        const currentPage = document.getElementById(currentPath);
        if (currentPage) {
            currentPage.classList.add('active');
        }
    }

    // 添加前置路由守卫
    beforeEach(hook) {
        this.beforeRouteHooks.push(hook);
    }

    // 添加后置路由钩子
    afterEach(hook) {
        this.afterRouteHooks.push(hook);
    }

    // 处理路由错误
    handleRouteError(error) {
        components.showNotification('页面加载失败，请稍后重试', 'error');
    }

    // 获取当前路由
    getCurrentRoute() {
        return this.currentRoute;
    }

    // 获取路由参数（从URL hash中提取）
    getParams() {
        const hash = window.location.hash.slice(1);
        const [route, ...params] = hash.split('/');
        return params;
    }

    // 设置路由参数
    setParams(params) {
        const currentRoute = this.getCurrentRoute();
        const newHash = [currentRoute, ...params].join('/');
        window.history.replaceState(null, null, `#${newHash}`);
    }
}

// 页面控制器基类
class PageController {
    constructor(pageId) {
        this.pageId = pageId;
        this.isInitialized = false;
        this.data = {};
        this.components = {};
    }

    // 页面初始化
    async init() {
        if (!this.isInitialized) {
            await this.onInit();
            this.bindEvents();
            this.isInitialized = true;
        }
    }

    // 页面激活
    async activate() {
        await this.init();
        await this.onActivate();
        this.updateUI();
    }

    // 页面停用
    async deactivate() {
        await this.onDeactivate();
    }

    // 子类需要实现的方法
    async onInit() {
        // 页面初始化逻辑
    }

    async onActivate() {
        // 页面激活逻辑
    }

    async onDeactivate() {
        // 页面停用逻辑
    }

    bindEvents() {
        // 绑定事件处理器
    }

    updateUI() {
        // 更新界面
    }

    // 工具方法
    getElement(selector) {
        const page = document.getElementById(this.pageId);
        return page ? page.querySelector(selector) : null;
    }

    getAllElements(selector) {
        const page = document.getElementById(this.pageId);
        return page ? page.querySelectorAll(selector) : [];
    }

    showLoading(container) {
        const targetContainer = typeof container === 'string' ? document.querySelector(container) : container;
        if (targetContainer) {
            targetContainer.innerHTML = `
                <div class="loading-container" style="text-align: center; padding: 2rem;">
                    <div class="loading" style="margin: 0 auto 1rem;"></div>
                    <p style="color: var(--neutral-500);">加载中...</p>
                </div>
            `;
        }
    }

    hideLoading() {
        // 隐藏加载状态的逻辑
    }
}

// 具体页面控制器

// 首页控制器
class HomeController extends PageController {
    constructor() {
        super('home');
    }

    async onActivate() {
        // 首页激活时的逻辑
        document.title = '科研资讯推送管理系统';
        // 检查登录状态并更新UI
        this.updateAuthState();
    }

    bindEvents() {
        const getStartedBtn = this.getElement('#getStartedBtn');
        const learnMoreBtn = this.getElement('#learnMoreBtn');

        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', () => {
                const currentUser = dataService.getCurrentUser();
                if (currentUser) {
                    router.navigateTo('profile');
                } else {
                    this.showLoginModal();
                }
            });
        }

        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', () => {
                router.navigateTo('hospitals');
            });
        }
    }

    showLoginModal() {
        const loginForm = `
            <form id="loginForm">
                <div class="form-group">
                    <label>用户名/手机号</label>
                    <input type="text" name="username" required class="form-input" placeholder="请输入用户名或手机号">
                </div>
                <div class="form-group">
                    <label>密码</label>
                    <input type="password" name="password" required class="form-input" placeholder="请输入密码">
                </div>
            </form>
        `;

        components.createModal({
            title: '用户登录',
            content: loginForm,
            footerButtons: [
                { text: '取消', class: 'btn-secondary', onClick: () => components.closeModal() },
                { text: '登录', class: 'btn-primary', onClick: () => this.handleLogin() }
            ]
        });
    }

    async handleLogin() {
        const form = document.getElementById('loginForm');
        const formData = new FormData(form);

        try {
            const result = await dataService.login({
                username: formData.get('username'),
                password: formData.get('password')
            });

            if (result.success) {
                components.closeModal();
                components.showNotification('登录成功', 'success');

                if (result.isAdmin) {
                    window.location.href = 'admin.html';
                } else {
                    router.navigateTo('profile');
                }

                this.updateAuthState();
            } else {
                components.showNotification(result.message || '登录失败', 'error');
            }
        } catch (error) {
            components.showNotification('登录失败，请稍后重试', 'error');
        }
    }

    updateAuthState() {
        const currentUser = dataService.getCurrentUser();
        const navActions = document.querySelector('.nav-actions');

        if (currentUser && navActions) {
            navActions.innerHTML = `
                <span class="user-greeting" style="color: var(--neutral-700); font-weight: var(--font-weight-medium);">欢迎，${currentUser.name}</span>
                <button class="btn-primary" onclick="router.navigateTo('profile')">个人中心</button>
                <button class="btn-secondary" onclick="homeController.handleLogout()">退出</button>
            `;
        }
    }

    handleLogout() {
        components.confirm('确定要退出登录吗？', () => {
            dataService.logout();
            components.showNotification('已退出登录', 'success');
            this.resetAuthState();
        });
    }

    resetAuthState() {
        const navActions = document.querySelector('.nav-actions');
        navActions.innerHTML = `
            <button class="btn-secondary" id="loginBtn">登录</button>
            <button class="btn-primary" id="registerBtn">注册</button>
        `;
        this.bindEvents(); // 重新绑定事件
    }
}

// 医院列表控制器
class HospitalsController extends PageController {
    constructor() {
        super('hospitals');
        this.currentPage = 1;
        this.pageSize = 6;
        this.searchText = '';
    }

    async onActivate() {
        document.title = '医院列表 - 科研资讯推送管理系统';
        await this.loadHospitals();
    }

    bindEvents() {
        const searchInput = this.getElement('#hospitalSearch');
        const searchBtn = this.getElement('.search-btn');

        if (searchInput && searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.searchText = searchInput.value.trim();
                this.currentPage = 1;
                this.loadHospitals();
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchText = searchInput.value.trim();
                    this.currentPage = 1;
                    this.loadHospitals();
                }
            });
        }
    }

    async loadHospitals() {
        try {
            this.showLoading('#hospitalList');

            const result = await dataService.getHospitals({
                page: this.currentPage,
                pageSize: this.pageSize,
                search: this.searchText
            });

            this.renderHospitals(result.data);
            this.renderPagination(result);

        } catch (error) {
            components.showNotification('加载医院列表失败', 'error');
        }
    }

    renderHospitals(hospitals) {
        const container = this.getElement('#hospitalList');

        if (hospitals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>暂无医院数据</p>
                </div>
            `;
            return;
        }

        container.innerHTML = hospitals.map(hospital => `
            <div class="card hospital-card" data-id="${hospital.id}" onclick="router.navigateToHospitalDepartments(${hospital.id}, '${hospital.name}')">
                <div class="card-header">
                    <h3 class="card-title">${hospital.name}</h3>
                    <span class="card-date">${hospital.submitDate} 申报</span>
                </div>
                <p class="card-description">${hospital.description}</p>
                <div class="card-footer">
                    <div class="hospital-info">
                        <span class="badge badge-primary">${hospital.level}</span>
                        <span class="text-sm text-neutral-500">${hospital.location}</span>
                    </div>
                    <span class="card-link">
                        查看科室 →
                    </span>
                </div>
            </div>
        `).join('');
    }

    renderPagination(result) {
        const paginationContainer = document.querySelector('#hospitals .pagination');
        if (paginationContainer) {
            components.createPagination(paginationContainer, {
                currentPage: result.page,
                totalPages: result.totalPages,
                onPageChange: (page) => {
                    this.currentPage = page;
                    this.loadHospitals();
                }
            });
        }
    }

    showHospitalDetail(hospitalId) {
        // 显示医院详情模态框
        dataService.getHospitalById(hospitalId).then(hospital => {
            const detailContent = `
                <div class="hospital-detail">
                    <h3>${hospital.name}</h3>
                    <div class="detail-info">
                        <p><strong>等级：</strong>${hospital.level}</p>
                        <p><strong>类型：</strong>${hospital.type}</p>
                        <p><strong>地区：</strong>${hospital.location}</p>
                        <p><strong>科室数：</strong>${hospital.departmentCount}</p>
                        <p><strong>用户数：</strong>${hospital.userCount}</p>
                        <p><strong>申报日期：</strong>${hospital.submitDate}</p>
                    </div>
                    <div class="detail-description">
                        <h4>医院简介</h4>
                        <p>${hospital.description}</p>
                    </div>
                </div>
            `;

            components.createModal({
                title: '医院详情',
                content: detailContent,
                size: 'large',
                footerButtons: [
                    { text: '关闭', class: 'btn-secondary', onClick: () => components.closeModal() }
                ]
            });
        });
    }
}

// 科室列表控制器 - 类似医院列表控制器的实现
class DepartmentsController extends PageController {
    constructor() {
        super('departments');
        this.currentPage = 1;
        this.pageSize = 6;
        this.searchText = '';
    }

    async onActivate(params = {}) {
        document.title = '科室列表 - 科研资讯推送管理系统';

        // 更新面包屑导航和页面标题
        if (params.hospital && params.name) {
            this.updatePageContent(params.hospital, params.name);
        }

        await this.loadDepartments(params);
        this.bindEvents();
    }

    updatePageContent(hospitalId, hospitalName) {
        // 更新面包屑导航
        const hospitalNameEl = document.getElementById('hospitalName');
        if (hospitalNameEl) {
            hospitalNameEl.textContent = hospitalName + ' - 科室列表';
        }

        // 更新页面标题
        const pageTitle = document.getElementById('departmentPageTitle');
        if (pageTitle) {
            pageTitle.textContent = hospitalName + ' - 科室列表';
        }

        // 更新返回按钮
        const backBtn = document.getElementById('backToHospitals');
        if (backBtn) {
            backBtn.onclick = () => router.navigateTo('hospitals');
        }
    }

    bindEvents() {
        const searchInput = this.getElement('#departmentSearch');
        const searchBtn = this.getElement('.search-btn');

        if (searchInput && searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.searchText = searchInput.value.trim();
                this.currentPage = 1;
                this.loadDepartments();
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchText = searchInput.value.trim();
                    this.currentPage = 1;
                    this.loadDepartments();
                }
            });
        }
    }

    async loadDepartments() {
        try {
            this.showLoading('#departmentList');

            const result = await dataService.getDepartments({
                page: this.currentPage,
                pageSize: this.pageSize,
                search: this.searchText
            });

            this.renderDepartments(result.data);
            this.renderPagination(result);

        } catch (error) {
            components.showNotification('加载科室列表失败', 'error');
        }
    }

    renderDepartments(departments) {
        const container = this.getElement('#departmentList');

        if (departments.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>暂无科室数据</p></div>`;
            return;
        }

        container.innerHTML = departments.map(dept => `
            <div class="card department-card" data-id="${dept.id}" onclick="router.navigateToDepartmentProjects(${dept.hospitalId}, '${dept.hospitalName}', ${dept.id}, '${dept.name}')">
                <div class="card-header">
                    <h3 class="card-title">${dept.name}</h3>
                    <span class="card-date">${dept.submitDate} 申报</span>
                </div>
                <p class="card-description">${dept.description}</p>
                <div class="department-meta">
                    <span class="text-sm text-neutral-500">所属医院：${dept.hospitalName}</span>
                    <span class="text-sm text-neutral-500">负责人：${dept.director}</span>
                </div>
                <div class="card-footer">
                    <div class="department-tags">
                        ${dept.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <span class="card-link">
                        查看课题 →
                    </span>
                </div>
            </div>
        `).join('');
    }

    renderPagination(result) {
        const paginationContainer = document.querySelector('#departments .pagination');
        if (paginationContainer) {
            components.createPagination(paginationContainer, {
                currentPage: result.page,
                totalPages: result.totalPages,
                onPageChange: (page) => {
                    this.currentPage = page;
                    this.loadDepartments();
                }
            });
        }
    }

    showDepartmentDetail(deptId) {
        dataService.getDepartmentById(deptId).then(dept => {
            const detailContent = `
                <div class="department-detail">
                    <h3>${dept.name}</h3>
                    <div class="detail-info">
                        <p><strong>所属医院：</strong>${dept.hospitalName}</p>
                        <p><strong>负责人：</strong>${dept.director}</p>
                        <p><strong>成员数：</strong>${dept.memberCount}</p>
                        <p><strong>课题数：</strong>${dept.projectCount}</p>
                        <p><strong>申报日期：</strong>${dept.submitDate}</p>
                    </div>
                    <div class="detail-description">
                        <h4>科室简介</h4>
                        <p>${dept.description}</p>
                    </div>
                    <div class="detail-tags">
                        <h4>研究方向</h4>
                        <div class="tags-container">
                            ${dept.tags.map(tag => `<span class="badge badge-primary">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;

            components.createModal({
                title: '科室详情',
                content: detailContent,
                size: 'large',
                footerButtons: [
                    { text: '关闭', class: 'btn-secondary', onClick: () => components.closeModal() }
                ]
            });
        });
    }
}

// 课题列表控制器
class ProjectsController extends PageController {
    constructor() {
        super('projects');
        this.currentPage = 1;
        this.pageSize = 6;
        this.searchText = '';
        this.statusFilter = '';
    }

    async onActivate(params = {}) {
        document.title = '课题列表 - 科研资讯推送管理系统';

        // 更新面包屑导航和页面标题
        if (params.hospital && params.hospitalName && params.department && params.departmentName) {
            this.updatePageContent(params);
        }

        this.updateCreateButton();
        await this.loadProjects(params);
        this.bindEvents();
    }

    updatePageContent(params) {
        // 更新面包屑导航
        const breadcrumbHospital = document.getElementById('breadcrumbHospital');
        if (breadcrumbHospital) {
            breadcrumbHospital.textContent = params.hospitalName;
            breadcrumbHospital.onclick = () => router.navigateToHospitalDepartments(params.hospital, params.hospitalName);
        }

        const departmentName = document.getElementById('departmentName');
        if (departmentName) {
            departmentName.textContent = params.departmentName + ' - 课题列表';
        }

        // 更新页面标题
        const pageTitle = document.getElementById('projectPageTitle');
        if (pageTitle) {
            pageTitle.textContent = params.departmentName + ' - 课题列表';
        }

        // 更新返回按钮
        const backBtn = document.getElementById('backToDepartments');
        if (backBtn) {
            backBtn.onclick = () => router.navigateToHospitalDepartments(params.hospital, params.hospitalName);
        }
    }

    bindEvents() {
        const searchInput = this.getElement('#projectSearch');
        const searchBtn = this.getElement('.search-btn');
        const createBtn = this.getElement('#createProjectBtn');

        if (searchInput && searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.searchText = searchInput.value.trim();
                this.currentPage = 1;
                this.loadProjects();
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchText = searchInput.value.trim();
                    this.currentPage = 1;
                    this.loadProjects();
                }
            });
        }

        if (createBtn) {
            createBtn.addEventListener('click', () => {
                this.showCreateProjectModal();
            });
        }
    }

    updateCreateButton() {
        const createBtn = this.getElement('#createProjectBtn');
        const currentUser = dataService.getCurrentUser();

        if (createBtn) {
            if (!currentUser) {
                createBtn.disabled = true;
                createBtn.textContent = '请先登录';
            } else if (currentUser.certificationStatus !== 'verified') {
                createBtn.disabled = true;
                createBtn.textContent = '请先完成认证';
            } else {
                createBtn.disabled = false;
                createBtn.textContent = '新建课题';
            }
        }
    }

    async loadProjects() {
        try {
            this.showLoading('#projectList');

            const result = await dataService.getProjects({
                page: this.currentPage,
                pageSize: this.pageSize,
                search: this.searchText,
                status: this.statusFilter
            });

            this.renderProjects(result.data);
            this.renderPagination(result);

        } catch (error) {
            components.showNotification('加载课题列表失败', 'error');
        }
    }

    renderProjects(projects) {
        const container = this.getElement('#projectList');

        if (projects.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>暂无课题数据</p></div>`;
            return;
        }

        const statusMap = {
            'planning': '规划中',
            'ongoing': '进行中',
            'recruiting': '招募中',
            'completed': '已完成'
        };

        const statusClass = {
            'planning': 'status-pending',
            'ongoing': 'status-verified',
            'recruiting': 'status-unverified',
            'completed': 'status-neutral'
        };

        container.innerHTML = projects.map(project => `
            <div class="card project-card" data-id="${project.id}">
                <div class="card-header">
                    <h3 class="card-title">${project.title}</h3>
                    <span class="status-badge ${statusClass[project.status]}">${statusMap[project.status]}</span>
                </div>
                <div class="project-meta">
                    <span>负责人：${project.leader}</span>
                    <span>成员：${project.memberCount}人</span>
                </div>
                <p class="card-description">${components.truncateText(project.description, 120)}</p>
                <div class="project-tags">
                    ${project.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    ${project.tags.length > 3 ? `<span class="tag">+${project.tags.length - 3}</span>` : ''}
                </div>
                <div class="card-footer">
                    <span class="text-sm text-neutral-500">${project.hospitalName} - ${project.departmentName}</span>
                    <div class="project-actions">
                        <button class="btn btn-sm btn-secondary" onclick="projectsController.showProjectDetail(${project.id})">详情</button>
                        <button class="btn btn-sm btn-primary ${project.canJoin ? '' : 'disabled'}" onclick="projectsController.joinProject(${project.id})" ${project.canJoin ? '' : 'disabled'}>
                            ${project.isJoined ? '已加入' : '加入课题'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderPagination(result) {
        const paginationContainer = document.querySelector('#projects .pagination');
        if (paginationContainer) {
            components.createPagination(paginationContainer, {
                currentPage: result.page,
                totalPages: result.totalPages,
                onPageChange: (page) => {
                    this.currentPage = page;
                    this.loadProjects();
                }
            });
        }
    }

    showProjectDetail(projectId) {
        dataService.getProjectById(projectId).then(project => {
            const statusMap = {
                'planning': '规划中',
                'ongoing': '进行中',
                'recruiting': '招募中',
                'completed': '已完成'
            };

            const detailContent = `
                <div class="project-detail">
                    <div class="project-header">
                        <h3>${project.title}</h3>
                        <span class="status-badge status-${project.status}">${statusMap[project.status]}</span>
                    </div>
                    <div class="detail-info">
                        <div class="info-row">
                            <span><strong>负责人：</strong>${project.leader}</span>
                            <span><strong>成员数：</strong>${project.memberCount}人</span>
                        </div>
                        <div class="info-row">
                            <span><strong>预算：</strong>${project.budget}</span>
                            <span><strong>周期：</strong>${project.duration}</span>
                        </div>
                        <div class="info-row">
                            <span><strong>医院：</strong>${project.hospitalName}</span>
                            <span><strong>科室：</strong>${project.departmentName}</span>
                        </div>
                        <div class="info-row">
                            <span><strong>创建时间：</strong>${project.createDate}</span>
                        </div>
                    </div>
                    <div class="detail-description">
                        <h4>课题描述</h4>
                        <p>${project.description}</p>
                    </div>
                    <div class="detail-requirements">
                        <h4>参与要求</h4>
                        <p>${project.requirements}</p>
                    </div>
                    <div class="detail-tags">
                        <h4>研究标签</h4>
                        <div class="tags-container">
                            ${project.tags.map(tag => `<span class="badge badge-primary">${tag}</span>`).join('')}
                        </div>
                    </div>
                    <div class="detail-contact">
                        <h4>联系方式</h4>
                        <p>${project.contactInfo}</p>
                    </div>
                </div>
            `;

            components.createModal({
                title: '课题详情',
                content: detailContent,
                size: 'large',
                footerButtons: [
                    { text: '关闭', class: 'btn-secondary', onClick: () => components.closeModal() },
                    project.canJoin ? {
                        text: project.isJoined ? '已加入' : '加入课题',
                        class: project.isJoined ? 'btn-secondary disabled' : 'btn-primary',
                        onClick: project.isJoined ? null : () => {
                            components.closeModal();
                            this.joinProject(project.id);
                        }
                    } : null
                ].filter(Boolean)
            });
        });
    }

    async joinProject(projectId) {
        const currentUser = dataService.getCurrentUser();

        if (!currentUser) {
            components.showNotification('请先登录', 'warning');
            return;
        }

        if (currentUser.certificationStatus !== 'verified') {
            components.showNotification('请先完成身份认证', 'warning');
            return;
        }

        // 显示申请加入模态弹窗
        this.showJoinProjectModal(projectId);
    }

    showJoinProjectModal(projectId) {
        // 获取课题信息
        const project = dataService.getProjectById(projectId);
        if (!project) {
            components.showNotification('课题信息不存在', 'error');
            return;
        }

        // 填充模态弹窗信息
        document.getElementById('joinProjectTitle').textContent = project.title;
        document.getElementById('joinProjectDescription').textContent = project.description;
        document.getElementById('joinProjectLeader').textContent = project.leader;
        document.getElementById('joinProjectDepartment').textContent = `${project.hospitalName} - ${project.departmentName}`;

        // 显示模态弹窗
        const modal = document.getElementById('joinProjectModal');
        modal.style.display = 'flex';

        // 绑定事件
        this.bindJoinModalEvents(projectId);
    }

    bindJoinModalEvents(projectId) {
        // 关闭按钮
        document.getElementById('closeJoinModal').onclick = () => {
            document.getElementById('joinProjectModal').style.display = 'none';
        };

        // 取消按钮
        document.getElementById('cancelJoinBtn').onclick = () => {
            document.getElementById('joinProjectModal').style.display = 'none';
        };

        // 提交表单
        document.getElementById('joinProjectForm').onsubmit = async (e) => {
            e.preventDefault();
            await this.submitJoinApplication(projectId);
        };

        // 点击模态背景关闭
        document.getElementById('joinProjectModal').onclick = (e) => {
            if (e.target.id === 'joinProjectModal') {
                document.getElementById('joinProjectModal').style.display = 'none';
            }
        };
    }

    async submitJoinApplication(projectId) {
        const formData = {
            projectId,
            reason: document.getElementById('joinReason').value,
            role: document.getElementById('joinRole').value,
            experience: document.getElementById('joinExperience').value,
            contact: document.getElementById('joinContact').value
        };

        try {
            const result = await dataService.submitJoinApplication(formData);
            if (result.success) {
                components.showNotification('申请已提交，请等待审核', 'success');
                document.getElementById('joinProjectModal').style.display = 'none';
                // 清空表单
                document.getElementById('joinProjectForm').reset();
            }
        } catch (error) {
            components.showNotification(error.message || '提交失败', 'error');
        }
    }

    showCreateProjectModal() {
        const currentUser = dataService.getCurrentUser();

        if (!currentUser) {
            components.showNotification('请先登录', 'warning');
            return;
        }

        if (currentUser.certificationStatus !== 'verified') {
            components.showNotification('请先完成身份认证', 'warning');
            return;
        }

        // 这里应该显示创建课题的复杂表单
        // 简化版本，实际项目中需要实现完整的标签选择器
        const createForm = `
            <form id="createProjectForm">
                <div class="form-group">
                    <label>课题名称 <span style="color: var(--error-500);">*</span></label>
                    <input type="text" name="title" required class="form-input" placeholder="请输入课题名称（6-60个字符）" maxlength="60">
                </div>
                <div class="form-group">
                    <label>课题描述 <span style="color: var(--error-500);">*</span></label>
                    <textarea name="description" required class="form-input" rows="4" placeholder="请详细描述课题内容和目标"></textarea>
                </div>
                <div class="form-group">
                    <label>预算（万元）</label>
                    <input type="text" name="budget" class="form-input" placeholder="例如：50万">
                </div>
                <div class="form-group">
                    <label>研究周期</label>
                    <input type="text" name="duration" class="form-input" placeholder="例如：24个月">
                </div>
                <div class="form-group">
                    <label>参与要求</label>
                    <textarea name="requirements" class="form-input" rows="3" placeholder="请描述参与者的专业要求"></textarea>
                </div>
                <div class="form-group">
                    <label>联系方式</label>
                    <input type="email" name="contactInfo" class="form-input" placeholder="请输入联系邮箱">
                </div>
            </form>
        `;

        components.createModal({
            title: '新建课题',
            content: createForm,
            size: 'large',
            footerButtons: [
                { text: '取消', class: 'btn-secondary', onClick: () => components.closeModal() },
                { text: '创建', class: 'btn-primary', onClick: () => this.handleCreateProject() }
            ]
        });
    }

    async handleCreateProject() {
        const form = document.getElementById('createProjectForm');
        const formData = new FormData(form);

        const projectData = {
            title: formData.get('title'),
            description: formData.get('description'),
            budget: formData.get('budget') || '待定',
            duration: formData.get('duration') || '待定',
            requirements: formData.get('requirements') || '无特殊要求',
            contactInfo: formData.get('contactInfo') || '',
            tags: ['临床研究'] // 简化版本，实际需要标签选择器
        };

        try {
            const result = await dataService.createProject(projectData);
            components.closeModal();
            components.showNotification('课题创建成功', 'success');
            await this.loadProjects(); // 刷新列表
        } catch (error) {
            components.showNotification(error.message || '创建失败', 'error');
        }
    }
}

// 个人中心控制器
class ProfileController extends PageController {
    constructor() {
        super('profile');
        this.currentTab = 'info';
    }

    async onActivate() {
        document.title = '个人中心 - 科研资讯推送管理系统';
        this.updateUserInfo();
        this.bindTabEvents();
        this.switchTab(this.currentTab);
    }

    updateUserInfo() {
        const currentUser = dataService.getCurrentUser();

        const userNameEl = this.getElement('#userName');
        const userRoleEl = this.getElement('#userRole');
        const certificationStatusEl = this.getElement('#certificationStatus');

        if (!currentUser) {
            // 未登录状态的处理
            if (userNameEl) userNameEl.textContent = '未登录';
            if (userRoleEl) userRoleEl.textContent = '请先登录';
            if (certificationStatusEl) certificationStatusEl.innerHTML = '<span class="status-badge status-unverified">未认证</span>';
            return;
        }

        if (userNameEl) userNameEl.textContent = currentUser.name || '未设置';
        if (userRoleEl) userRoleEl.textContent = currentUser.title || '用户';

        const statusMap = {
            'unverified': { text: '未认证', class: 'status-unverified' },
            'pending': { text: '认证中', class: 'status-pending' },
            'verified': { text: '已认证', class: 'status-verified' },
            'rejected': { text: '认证失败', class: 'status-rejected' }
        };

        const status = statusMap[currentUser.certificationStatus] || statusMap.unverified;
        if (certificationStatusEl) {
            certificationStatusEl.innerHTML = `<span class="status-badge ${status.class}">${status.text}</span>`;
        }

        // 填充表单数据
        const profileName = this.getElement('#profileName');
        const profilePhone = this.getElement('#profilePhone');
        const profileEmail = this.getElement('#profileEmail');

        if (profileName) profileName.value = currentUser.name || '';
        if (profilePhone) profilePhone.value = currentUser.phone || '';
        if (profileEmail) profileEmail.value = currentUser.email || '';
    }

    bindTabEvents() {
        this.getAllElements('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.dataset.tab;
                this.switchTab(tab);
            });
        });

        // 开始认证按钮
        const startCertBtn = this.getElement('#startCertificationBtn');
        if (startCertBtn) {
            startCertBtn.addEventListener('click', () => {
                this.showCertificationModal();
            });
        }
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // 更新菜单状态
        this.getAllElements('.menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.tab === tabName) {
                item.classList.add('active');
            }
        });

        // 更新内容区域
        this.getAllElements('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        const targetContent = this.getElement(`#${tabName}`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    }

    showCertificationModal() {
        const currentUser = dataService.getCurrentUser();

        if (!currentUser) {
            components.showNotification('请先登录', 'warning');
            return;
        }

        const certForm = `
            <form id="certificationForm" enctype="multipart/form-data">
                <div class="form-group">
                    <label>证件类型 <span style="color: var(--error-500);">*</span></label>
                    <select name="certificateType" required class="form-input">
                        <option value="">请选择证件类型</option>
                        <option value="doctor">医师执业证</option>
                        <option value="nurse">护士执业证</option>
                        <option value="researcher">科研人员证明</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>证件号码 <span style="color: var(--error-500);">*</span></label>
                    <input type="text" name="certificateNumber" required class="form-input" placeholder="请输入证件号码">
                </div>
                <div class="form-group">
                    <label>医院名称 <span style="color: var(--error-500);">*</span></label>
                    <input type="text" name="hospitalName" required class="form-input" placeholder="请输入医院名称">
                </div>
                <div class="form-group">
                    <label>科室名称 <span style="color: var(--error-500);">*</span></label>
                    <input type="text" name="departmentName" required class="form-input" placeholder="请输入科室名称">
                </div>
                <div class="form-group">
                    <label>证件有效期</label>
                    <input type="date" name="expiryDate" class="form-input">
                </div>
                <div class="form-group">
                    <label>证件照片 <span style="color: var(--error-500);">*</span></label>
                    <input type="file" name="certificateImages" required class="form-input" accept="image/*" multiple>
                    <small style="color: var(--neutral-500);">支持上传多张图片，文件大小不超过5MB</small>
                </div>
            </form>
        `;

        components.createModal({
            title: '身份认证申请',
            content: certForm,
            size: 'medium',
            footerButtons: [
                { text: '取消', class: 'btn-secondary', onClick: () => components.closeModal() },
                { text: '提交申请', class: 'btn-primary', onClick: () => this.handleCertificationSubmit() }
            ]
        });
    }

    async handleCertificationSubmit() {
        const form = document.getElementById('certificationForm');
        const formData = new FormData(form);

        const certData = {
            certificateType: formData.get('certificateType'),
            certificateNumber: formData.get('certificateNumber'),
            hospitalName: formData.get('hospitalName'),
            departmentName: formData.get('departmentName'),
            expiryDate: formData.get('expiryDate') || null,
            certificateImages: ['cert_image.jpg'] // 简化处理
        };

        try {
            const result = await dataService.submitCertification(certData);
            components.closeModal();
            components.showNotification('认证申请已提交，请等待审核', 'success');
            this.updateUserInfo(); // 更新用户信息显示
        } catch (error) {
            components.showNotification(error.message || '提交失败', 'error');
        }
    }
}

// 创建路由实例和页面控制器实例
const router = new Router();
const homeController = new HomeController();
const hospitalsController = new HospitalsController();
const departmentsController = new DepartmentsController();
const projectsController = new ProjectsController();
const profileController = new ProfileController();

// 注册路由
router.register('home', async () => {
    await homeController.activate();
});

router.register('hospitals', async (params) => {
    await hospitalsController.activate(params);
});

router.register('departments', async (params) => {
    await departmentsController.activate(params);
});

router.register('projects', async (params) => {
    await projectsController.activate(params);
});

router.register('profile', async () => {
    await profileController.activate();
});

// 路由守卫 - 检查认证状态
router.beforeEach((to, from) => {
    // 这里可以添加全局的路由守卫逻辑
    return true;
});

// 导出到全局
window.router = router;
window.homeController = homeController;
window.hospitalsController = hospitalsController;
window.departmentsController = departmentsController;
window.projectsController = projectsController;
window.profileController = profileController;