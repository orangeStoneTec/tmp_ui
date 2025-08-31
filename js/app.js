// 应用主入口文件

class Application {
    constructor() {
        this.isInitialized = false;
        this.currentUser = null;
    }

    // 初始化应用
    async init() {
        if (this.isInitialized) return;

        try {
            // 显示加载状态
            this.showInitialLoading();
            
            // 初始化用户状态
            await this.initUserState();
            
            // 初始化全局事件监听
            this.initGlobalEvents();
            
            // 初始化主题和样式
            this.initTheme();
            
            // 隐藏加载状态
            this.hideInitialLoading();
            
            this.isInitialized = true;
            
            console.log('应用初始化完成');
            
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.showInitError();
        }
    }

    // 显示初始加载状态
    showInitialLoading() {
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'initialLoading';
        loadingOverlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.95);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                font-family: var(--font-family-base);
            ">
                <div class="loading" style="margin-bottom: 1rem;"></div>
                <p style="color: var(--neutral-600); font-size: var(--text-base);">正在初始化应用...</p>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    }

    // 隐藏初始加载状态
    hideInitialLoading() {
        const loading = document.getElementById('initialLoading');
        if (loading) {
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.remove();
            }, 300);
        }
    }

    // 显示初始化错误
    showInitError() {
        const errorOverlay = document.createElement('div');
        errorOverlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: white;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                font-family: var(--font-family-base);
                text-align: center;
                padding: 2rem;
            ">
                <div style="color: var(--error-500); font-size: 3rem; margin-bottom: 1rem;">⚠</div>
                <h2 style="color: var(--neutral-900); margin-bottom: 1rem;">应用初始化失败</h2>
                <p style="color: var(--neutral-600); margin-bottom: 2rem;">
                    请检查网络连接或刷新页面重试
                </p>
                <button onclick="window.location.reload()" class="btn-primary">
                    刷新页面
                </button>
            </div>
        `;
        document.body.appendChild(errorOverlay);
    }

    // 初始化用户状态
    async initUserState() {
        this.currentUser = dataService.getCurrentUser();
        this.updateGlobalUserState();
    }

    // 更新全局用户状态
    updateGlobalUserState() {
        const body = document.body;
        
        if (this.currentUser) {
            body.classList.add('user-logged-in');
            body.classList.remove('user-logged-out');
            
            // 更新用户信息显示
            this.updateUserDisplay();
        } else {
            body.classList.add('user-logged-out');
            body.classList.remove('user-logged-in');
        }
    }

    // 更新用户信息显示
    updateUserDisplay() {
        const userGreeting = document.querySelector('.user-greeting');
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        
        if (this.currentUser && userGreeting) {
            userGreeting.textContent = `欢迎，${this.currentUser.name}`;
        }
    }

    // 初始化全局事件监听
    initGlobalEvents() {
        // 监听用户状态变化
        document.addEventListener('userStateChanged', (e) => {
            this.currentUser = e.detail.user;
            this.updateGlobalUserState();
        });

        // 监听网络状态
        window.addEventListener('online', () => {
            components.showNotification('网络已连接', 'success', 2000);
        });

        window.addEventListener('offline', () => {
            components.showNotification('网络已断开', 'error', 0);
        });

        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // 页面隐藏时的处理
                this.onPageHidden();
            } else {
                // 页面显示时的处理
                this.onPageVisible();
            }
        });

        // 监听窗口大小变化
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.onWindowResize();
            }, 250);
        });

        // 全局错误处理
        window.addEventListener('error', (event) => {
            console.error('全局错误:', event.error);
            this.handleGlobalError(event.error);
        });

        // 未处理的Promise拒绝
        window.addEventListener('unhandledrejection', (event) => {
            console.error('未处理的Promise拒绝:', event.reason);
            this.handleGlobalError(event.reason);
        });
    }

    // 初始化主题
    initTheme() {
        // 检查是否有保存的主题偏好
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // 检查系统主题偏好
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                this.setTheme('dark');
            } else {
                this.setTheme('light');
            }
        }

        // 监听系统主题变化
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    // 设置主题
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    // 页面隐藏时的处理
    onPageHidden() {
        // 可以添加页面隐藏时的逻辑，如暂停定时器等
    }

    // 页面显示时的处理
    onPageVisible() {
        // 可以添加页面显示时的逻辑，如恢复定时器、检查更新等
        this.checkForUpdates();
    }

    // 窗口大小变化处理
    onWindowResize() {
        // 更新响应式组件
        this.updateResponsiveComponents();
    }

    // 更新响应式组件
    updateResponsiveComponents() {
        // 重新计算下拉菜单位置等
        const dropdowns = document.querySelectorAll('.dropdown-menu');
        dropdowns.forEach(dropdown => {
            // 重新定位下拉菜单
        });
    }

    // 检查更新
    async checkForUpdates() {
        // 在实际项目中，这里可以检查是否有新版本
        // 简单的缓存刷新逻辑
        if ('serviceWorker' in navigator) {
            // Service Worker 相关逻辑
        }
    }

    // 全局错误处理
    handleGlobalError(error) {
        // 开发环境显示详细错误
        if (process?.env?.NODE_ENV === 'development') {
            console.error('详细错误信息:', error);
        }

        // 用户友好的错误提示
        let userMessage = '系统出现异常，请稍后重试';
        
        if (error?.message?.includes('Network')) {
            userMessage = '网络连接异常，请检查网络';
        } else if (error?.message?.includes('Permission')) {
            userMessage = '权限不足，请重新登录';
        }

        components.showNotification(userMessage, 'error');
    }

    // 用户登录
    async login(credentials) {
        try {
            const result = await dataService.login(credentials);
            
            if (result.success) {
                this.currentUser = result.user;
                this.updateGlobalUserState();
                
                // 触发用户状态变化事件
                document.dispatchEvent(new CustomEvent('userStateChanged', {
                    detail: { user: this.currentUser }
                }));
                
                return result;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('登录失败:', error);
            throw error;
        }
    }

    // 用户退出
    logout() {
        dataService.logout();
        this.currentUser = null;
        this.updateGlobalUserState();
        
        // 触发用户状态变化事件
        document.dispatchEvent(new CustomEvent('userStateChanged', {
            detail: { user: null }
        }));
        
        // 跳转到首页
        router.navigateTo('home');
    }

    // 显示登录模态框
    showLoginModal() {
        const loginForm = `
            <form id="globalLoginForm">
                <div class="form-group">
                    <label>用户名/手机号</label>
                    <input type="text" name="username" required class="form-input" placeholder="请输入用户名或手机号">
                </div>
                <div class="form-group">
                    <label>密码</label>
                    <input type="password" name="password" required class="form-input" placeholder="请输入密码">
                </div>
                <div style="text-align: right; margin-top: 0.5rem;">
                    <a href="#" style="font-size: 0.875rem; color: var(--primary-600);" onclick="app.showRegisterModal(); components.closeModal();">没有账号？立即注册</a>
                </div>
            </form>
        `;

        components.createModal({
            title: '用户登录',
            content: loginForm,
            footerButtons: [
                { text: '取消', class: 'btn-secondary', onClick: () => components.closeModal() },
                { text: '登录', class: 'btn-primary', onClick: () => this.handleGlobalLogin() }
            ]
        });
    }

    // 处理登录
    async handleGlobalLogin() {
        const form = document.getElementById('globalLoginForm');
        const formData = new FormData(form);
        
        try {
            const result = await this.login({
                username: formData.get('username'),
                password: formData.get('password')
            });

            components.closeModal();
            components.showNotification('登录成功', 'success');
            
            if (result.isAdmin) {
                window.location.href = 'admin.html';
            }
            
        } catch (error) {
            components.showNotification(error.message || '登录失败', 'error');
        }
    }

    // 显示注册模态框
    showRegisterModal() {
        const registerForm = `
            <form id="globalRegisterForm">
                <div class="form-group">
                    <label>姓名 <span style="color: var(--error-500);">*</span></label>
                    <input type="text" name="name" required class="form-input" placeholder="请输入真实姓名">
                </div>
                <div class="form-group">
                    <label>手机号 <span style="color: var(--error-500);">*</span></label>
                    <input type="tel" name="phone" required class="form-input" placeholder="请输入手机号">
                </div>
                <div class="form-group">
                    <label>邮箱 <span style="color: var(--error-500);">*</span></label>
                    <input type="email" name="email" required class="form-input" placeholder="请输入邮箱地址">
                </div>
                <div class="form-group">
                    <label>密码 <span style="color: var(--error-500);">*</span></label>
                    <input type="password" name="password" required class="form-input" placeholder="请输入密码（至少6位）" minlength="6">
                </div>
                <div class="form-group">
                    <label>确认密码 <span style="color: var(--error-500);">*</span></label>
                    <input type="password" name="confirmPassword" required class="form-input" placeholder="请再次输入密码">
                </div>
                <div style="text-align: right; margin-top: 0.5rem;">
                    <a href="#" style="font-size: 0.875rem; color: var(--primary-600);" onclick="app.showLoginModal(); components.closeModal();">已有账号？立即登录</a>
                </div>
            </form>
        `;

        components.createModal({
            title: '用户注册',
            content: registerForm,
            footerButtons: [
                { text: '取消', class: 'btn-secondary', onClick: () => components.closeModal() },
                { text: '注册', class: 'btn-primary', onClick: () => this.handleGlobalRegister() }
            ]
        });
    }

    // 处理注册
    async handleGlobalRegister() {
        const form = document.getElementById('globalRegisterForm');
        const formData = new FormData(form);
        
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        if (password !== confirmPassword) {
            components.showNotification('两次输入的密码不一致', 'error');
            return;
        }
        
        const userData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            password: password
        };

        try {
            const result = await dataService.register(userData);
            
            if (result.success) {
                components.closeModal();
                components.showNotification('注册成功，请登录', 'success');
                setTimeout(() => {
                    this.showLoginModal();
                }, 1000);
            }
        } catch (error) {
            components.showNotification(error.message || '注册失败', 'error');
        }
    }

    // 工具方法：格式化时间
    formatTime(date) {
        return new Intl.DateTimeFormat('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    }

    // 工具方法：防抖
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 工具方法：节流
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// 创建应用实例
const app = new Application();

// 绑定全局登录注册按钮事件
document.addEventListener('DOMContentLoaded', () => {
    // 登录按钮
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            app.showLoginModal();
        });
    }

    // 注册按钮
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            app.showRegisterModal();
        });
    }

    // 初始化应用
    app.init();
});

// 导出到全局
window.app = app;