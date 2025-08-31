// 公共组件库

class ComponentLibrary {
    constructor() {
        this.modals = new Map();
        this.notifications = [];
        this.initializeEventListeners();
    }

    // 初始化事件监听
    initializeEventListeners() {
        // 全局点击事件委托
        document.addEventListener('click', (e) => {
            // 关闭模态弹窗
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }

            // 关闭下拉菜单
            if (!e.target.closest('.dropdown')) {
                this.closeAllDropdowns();
            }
        });

        // ESC键关闭模态弹窗
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeAllDropdowns();
            }
        });
    }

    // 创建模态弹窗
    createModal(options = {}) {
        const {
            title = '提示',
            content = '',
            size = 'medium', // small, medium, large
            showCloseButton = true,
            showFooter = true,
            footerButtons = [
                { text: '取消', class: 'btn-secondary', onClick: () => this.closeModal() },
                { text: '确定', class: 'btn-primary', onClick: () => this.closeModal() }
            ],
            onClose = null
        } = options;

        const modalId = 'modal_' + Date.now();
        const sizeClass = {
            small: 'max-width: 400px',
            medium: 'max-width: 600px',
            large: 'max-width: 900px',
            full: 'max-width: 95vw'
        };

        const modalHTML = `
            <div class="modal-overlay" id="${modalId}">
                <div class="modal" style="${sizeClass[size]}">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        ${showCloseButton ? '<button class="modal-close" onclick="components.closeModal()">&times;</button>' : ''}
                    </div>
                    <div class="modal-content">
                        ${content}
                    </div>
                    ${showFooter ? `
                        <div class="modal-footer">
                            ${footerButtons.map(btn =>
            `<button class="${btn.class}" onclick="${btn.onClick ? 'this.dispatchEvent(new CustomEvent(\'btnClick\', {detail: \'' + btn.text + '\'}))' : 'components.closeModal()'}">${btn.text}</button>`
        ).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // 插入到页面
        const container = document.getElementById('modalContainer') || document.body;
        container.insertAdjacentHTML('beforeend', modalHTML);

        const modalElement = document.getElementById(modalId);

        // 绑定自定义按钮事件
        footerButtons.forEach(btn => {
            if (btn.onClick && typeof btn.onClick === 'function') {
                modalElement.addEventListener('btnClick', (e) => {
                    if (e.detail === btn.text) {
                        btn.onClick();
                    }
                });
            }
        });

        // 显示模态弹窗
        setTimeout(() => {
            modalElement.classList.add('active');
        }, 10);

        // 存储模态弹窗信息
        this.modals.set(modalId, {
            element: modalElement,
            onClose
        });

        return modalId;
    }

    // 关闭模态弹窗
    closeModal(modalId = null) {
        if (modalId) {
            const modal = this.modals.get(modalId);
            if (modal) {
                modal.element.classList.remove('active');
                setTimeout(() => {
                    modal.element.remove();
                    if (modal.onClose) modal.onClose();
                }, 200);
                this.modals.delete(modalId);
            }
        } else {
            // 关闭最后打开的模态弹窗
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                activeModal.classList.remove('active');
                setTimeout(() => {
                    activeModal.remove();
                }, 200);
            }
        }
    }

    // 确认对话框
    confirm(message, onConfirm, onCancel) {
        return new Promise((resolve) => {
            this.createModal({
                title: '确认',
                content: `<p>${message}</p>`,
                size: 'small',
                footerButtons: [
                    {
                        text: '取消',
                        class: 'btn-secondary',
                        onClick: () => {
                            this.closeModal();
                            if (onCancel) onCancel();
                            resolve(false);
                        }
                    },
                    {
                        text: '确定',
                        class: 'btn-primary',
                        onClick: () => {
                            this.closeModal();
                            if (onConfirm) onConfirm();
                            resolve(true);
                        }
                    }
                ]
            });
        });
    }

    // 警告对话框
    alert(message, onClose) {
        return this.createModal({
            title: '提示',
            content: `<p>${message}</p>`,
            size: 'small',
            footerButtons: [
                {
                    text: '确定',
                    class: 'btn-primary',
                    onClick: () => {
                        this.closeModal();
                        if (onClose) onClose();
                    }
                }
            ]
        });
    }

    // 加载对话框
    showLoading(message = '加载中...') {
        return this.createModal({
            title: '',
            content: `
                <div style="text-align: center; padding: 2rem;">
                    <div class="loading" style="margin: 0 auto 1rem;"></div>
                    <p>${message}</p>
                </div>
            `,
            size: 'small',
            showCloseButton: false,
            showFooter: false
        });
    }

    // 创建通知消息
    showNotification(message, type = 'info', duration = 3000) {
        const notificationId = 'notification_' + Date.now();
        const typeClasses = {
            success: 'alert-success',
            error: 'alert-error',
            warning: 'alert-warning',
            info: 'alert-info'
        };

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const notificationHTML = `
            <div class="notification ${typeClasses[type]}" id="${notificationId}" style="
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1050;
                min-width: 300px;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            ">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-weight: bold;">${icons[type]}</span>
                    <span>${message}</span>
                    <button onclick="components.closeNotification('${notificationId}')" style="
                        margin-left: auto;
                        background: none;
                        border: none;
                        font-size: 1.2rem;
                        cursor: pointer;
                        opacity: 0.7;
                    ">&times;</button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', notificationHTML);
        const notificationElement = document.getElementById(notificationId);

        // 显示动画
        setTimeout(() => {
            notificationElement.style.opacity = '1';
            notificationElement.style.transform = 'translateX(0)';
        }, 10);

        // 自动关闭
        if (duration > 0) {
            setTimeout(() => {
                this.closeNotification(notificationId);
            }, duration);
        }

        return notificationId;
    }

    // 关闭通知消息
    closeNotification(notificationId) {
        const notification = document.getElementById(notificationId);
        if (notification) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }

    // 创建下拉菜单
    createDropdown(triggerElement, options = []) {
        const dropdownId = 'dropdown_' + Date.now();
        const rect = triggerElement.getBoundingClientRect();

        const optionsHTML = options.map(option => {
            if (option.divider) {
                return '<div class="dropdown-divider"></div>';
            }
            return `
                <button class="dropdown-item" onclick="${option.onClick || ''}">
                    ${option.icon ? `<span class="dropdown-icon">${option.icon}</span>` : ''}
                    ${option.text}
                </button>
            `;
        }).join('');

        const dropdownHTML = `
            <div class="dropdown-menu" id="${dropdownId}" style="
                position: fixed;
                top: ${rect.bottom + 5}px;
                left: ${rect.left}px;
                z-index: 1000;
                background: white;
                border: 1px solid var(--neutral-200);
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                min-width: 150px;
                opacity: 0;
                transform: scale(0.95) translateY(-10px);
                transition: all 0.15s ease;
            ">
                ${optionsHTML}
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', dropdownHTML);
        const dropdown = document.getElementById(dropdownId);

        // 显示动画
        setTimeout(() => {
            dropdown.style.opacity = '1';
            dropdown.style.transform = 'scale(1) translateY(0)';
        }, 10);

        // 点击选项后关闭
        dropdown.addEventListener('click', (e) => {
            if (e.target.classList.contains('dropdown-item')) {
                this.closeDropdown(dropdownId);
            }
        });

        return dropdownId;
    }

    // 关闭下拉菜单
    closeDropdown(dropdownId) {
        const dropdown = document.getElementById(dropdownId);
        if (dropdown) {
            dropdown.style.opacity = '0';
            dropdown.style.transform = 'scale(0.95) translateY(-10px)';
            setTimeout(() => {
                dropdown.remove();
            }, 150);
        }
    }

    // 关闭所有下拉菜单
    closeAllDropdowns() {
        document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
            dropdown.style.opacity = '0';
            dropdown.style.transform = 'scale(0.95) translateY(-10px)';
            setTimeout(() => {
                dropdown.remove();
            }, 150);
        });
    }

    // 创建表单
    createForm(container, fields, options = {}) {
        const {
            submitText = '提交',
            cancelText = '取消',
            onSubmit = null,
            onCancel = null,
            showCancel = true
        } = options;

        const formHTML = `
            <form class="dynamic-form" style="max-width: 500px;">
                ${fields.map(field => this.createFormField(field)).join('')}
                <div class="form-actions" style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem;">
                    ${showCancel ? `<button type="button" class="btn-secondary cancel-btn">${cancelText}</button>` : ''}
                    <button type="submit" class="btn-primary submit-btn">${submitText}</button>
                </div>
            </form>
        `;

        const targetContainer = typeof container === 'string' ? document.getElementById(container) : container;
        targetContainer.innerHTML = formHTML;

        const form = targetContainer.querySelector('.dynamic-form');

        // 绑定提交事件
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = this.getFormData(form);
            if (onSubmit) onSubmit(formData);
        });

        // 绑定取消事件
        if (showCancel) {
            form.querySelector('.cancel-btn').addEventListener('click', () => {
                if (onCancel) onCancel();
            });
        }

        return form;
    }

    // 创建表单字段
    createFormField(field) {
        const {
            type = 'text',
            name,
            label,
            placeholder = '',
            required = false,
            options = [],
            value = ''
        } = field;

        let inputHTML = '';

        switch (type) {
            case 'select':
                inputHTML = `
                    <select class="form-input" name="${name}" ${required ? 'required' : ''}>
                        <option value="">${placeholder || '请选择'}</option>
                        ${options.map(opt =>
                    `<option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>${opt.text}</option>`
                ).join('')}
                    </select>
                `;
                break;
            case 'textarea':
                inputHTML = `
                    <textarea class="form-input" name="${name}" placeholder="${placeholder}" ${required ? 'required' : ''} rows="4">${value}</textarea>
                `;
                break;
            case 'file':
                inputHTML = `
                    <input type="file" class="form-input" name="${name}" ${required ? 'required' : ''} ${field.accept ? `accept="${field.accept}"` : ''} ${field.multiple ? 'multiple' : ''}>
                `;
                break;
            default:
                inputHTML = `
                    <input type="${type}" class="form-input" name="${name}" placeholder="${placeholder}" value="${value}" ${required ? 'required' : ''}>
                `;
        }

        return `
            <div class="form-group">
                <label>${label} ${required ? '<span style="color: var(--error-500);">*</span>' : ''}</label>
                ${inputHTML}
            </div>
        `;
    }

    // 获取表单数据
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                // 处理多选值
                if (Array.isArray(data[key])) {
                    data[key].push(value);
                } else {
                    data[key] = [data[key], value];
                }
            } else {
                data[key] = value;
            }
        }

        return data;
    }

    // 创建分页组件
    createPagination(container, options = {}) {
        const {
            currentPage = 1,
            totalPages = 1,
            onPageChange = null,
            showSizeChanger = false,
            pageSizes = [10, 20, 50],
            currentSize = 10
        } = options;

        let paginationHTML = '<div class="pagination">';

        // 上一页
        paginationHTML += `
            <button class="pagination-btn" ${currentPage <= 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
                &lt;
            </button>
        `;

        // 页码
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            paginationHTML += `<button class="pagination-btn" data-page="1">1</button>`;
            if (startPage > 2) {
                paginationHTML += '<span class="pagination-dots">...</span>';
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += '<span class="pagination-dots">...</span>';
            }
            paginationHTML += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
        }

        // 下一页
        paginationHTML += `
            <button class="pagination-btn" ${currentPage >= totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
                &gt;
            </button>
        `;

        paginationHTML += '</div>';

        // 页面大小选择器
        if (showSizeChanger) {
            paginationHTML += `
                <div class="page-size-selector" style="margin-left: 1rem;">
                    <select class="page-size-select">
                        ${pageSizes.map(size =>
                `<option value="${size}" ${size === currentSize ? 'selected' : ''}>${size} 条/页</option>`
            ).join('')}
                    </select>
                </div>
            `;
        }

        const targetContainer = typeof container === 'string' ? document.querySelector(container) : container;
        if (targetContainer) {
            targetContainer.innerHTML = paginationHTML;
        }

        // 绑定页码点击事件
        targetContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('pagination-btn') && !e.target.disabled) {
                const page = parseInt(e.target.dataset.page);
                if (onPageChange && page !== currentPage) {
                    onPageChange(page, currentSize);
                }
            }
        });

        // 绑定页面大小改变事件
        if (showSizeChanger) {
            const sizeSelect = targetContainer.querySelector('.page-size-select');
            sizeSelect.addEventListener('change', (e) => {
                const newSize = parseInt(e.target.value);
                if (onPageChange) {
                    onPageChange(1, newSize); // 切换页面大小时回到第一页
                }
            });
        }
    }

    // 创建数据表格
    createTable(container, options = {}) {
        const {
            columns = [],
            data = [],
            pagination = false,
            selectable = false,
            actions = [],
            emptyText = '暂无数据'
        } = options;

        let tableHTML = `
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            ${selectable ? '<th><input type="checkbox" class="select-all"></th>' : ''}
                            ${columns.map(col => `<th>${col.title}</th>`).join('')}
                            ${actions.length > 0 ? '<th>操作</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (data.length === 0) {
            tableHTML += `
                <tr>
                    <td colspan="${columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}" class="empty-state">
                        ${emptyText}
                    </td>
                </tr>
            `;
        } else {
            data.forEach(row => {
                tableHTML += '<tr>';

                if (selectable) {
                    tableHTML += `<td><input type="checkbox" value="${row.id || ''}"></td>`;
                }

                columns.forEach(col => {
                    let cellValue = row[col.key] || '';
                    if (col.render) {
                        cellValue = col.render(cellValue, row);
                    }
                    tableHTML += `<td>${cellValue}</td>`;
                });

                if (actions.length > 0) {
                    tableHTML += '<td class="table-actions">';
                    actions.forEach(action => {
                        tableHTML += `<button class="${action.class || 'btn-sm'}" onclick="${action.onClick}('${row.id}')">${action.text}</button>`;
                    });
                    tableHTML += '</td>';
                }

                tableHTML += '</tr>';
            });
        }

        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;

        const targetContainer = typeof container === 'string' ? document.getElementById(container) : container;
        targetContainer.innerHTML = tableHTML;

        // 绑定全选功能
        if (selectable) {
            const selectAll = targetContainer.querySelector('.select-all');
            const checkboxes = targetContainer.querySelectorAll('tbody input[type="checkbox"]');

            selectAll.addEventListener('change', () => {
                checkboxes.forEach(cb => cb.checked = selectAll.checked);
            });

            checkboxes.forEach(cb => {
                cb.addEventListener('change', () => {
                    selectAll.checked = Array.from(checkboxes).every(c => c.checked);
                });
            });
        }

        return targetContainer.querySelector('.data-table');
    }

    // 获取选中的表格行
    getSelectedRows(table) {
        const checkboxes = table.querySelectorAll('tbody input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    // 显示加载状态
    showLoading(container, text = '加载中...') {
        const targetContainer = typeof container === 'string' ? document.getElementById(container) : container;
        targetContainer.innerHTML = `
            <div class="loading-container" style="text-align: center; padding: 2rem;">
                <div class="loading" style="margin: 0 auto 1rem;"></div>
                <p style="color: var(--neutral-500);">${text}</p>
            </div>
        `;
    }

    // 格式化日期
    formatDate(date, format = 'YYYY-MM-DD') {
        if (!date) return '';

        const d = typeof date === 'string' ? new Date(date) : date;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes);
    }

    // 格式化数字
    formatNumber(num, decimals = 0) {
        if (isNaN(num)) return '';
        return Number(num).toLocaleString('zh-CN', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    // 截取文本
    truncateText(text, maxLength = 100) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// 创建全局组件实例
window.components = new ComponentLibrary();

// 添加样式
const componentStyles = `
<style>
.dropdown-menu {
    padding: 0.5rem 0;
}

.dropdown-item {
    width: 100%;
    padding: 0.5rem 1rem;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    transition: background-color 0.15s ease;
}

.dropdown-item:hover {
    background-color: var(--neutral-100);
}

.dropdown-divider {
    height: 1px;
    background-color: var(--neutral-200);
    margin: 0.5rem 0;
}

.dropdown-icon {
    width: 16px;
    text-align: center;
}

.dynamic-form .form-actions {
    border-top: 1px solid var(--neutral-200);
    padding-top: 1.5rem;
    margin-top: 1.5rem;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
}

.notification {
    padding: 1rem;
    margin-bottom: 0.5rem;
}

.page-size-selector {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    color: var(--neutral-600);
}

.page-size-select {
    margin-left: 0.5rem;
    padding: 0.25rem 0.5rem;
    border: 1px solid var(--neutral-300);
    border-radius: 0.375rem;
    font-size: 0.875rem;
}

.table-actions {
    white-space: nowrap;
}

.table-actions .btn {
    margin-right: 0.5rem;
}

.table-actions .btn:last-child {
    margin-right: 0;
}

.empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--neutral-500);
    font-style: italic;
}
</style>
`;

// 插入样式到页面
document.head.insertAdjacentHTML('beforeend', componentStyles);