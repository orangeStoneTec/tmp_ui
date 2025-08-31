// 数据模拟服务 - 模拟后端API数据

class DataService {
    constructor() {
        this.initializeData();
        this.currentUser = null;
        this.isLoggedIn = false;
    }

    // 初始化模拟数据
    initializeData() {
        // 医院数据
        this.hospitals = [
            {
                id: 1,
                name: '北京协和医院',
                submitDate: '2024-01-15',
                description: '国家级三甲医院，是集医疗、教学、科研为一体的大型综合性医院。拥有先进的医疗设备和优秀的医疗团队。',
                level: '三甲',
                type: '综合医院',
                location: '北京市',
                departmentCount: 45,
                userCount: 1250,
                status: 'active'
            },
            {
                id: 2,
                name: '上海瑞金医院',
                submitDate: '2024-01-14',
                description: '国家卫生健康委员会直属医院，是一所集医疗、教学、科研、预防为一体的综合性三级甲等医院。',
                level: '三甲',
                type: '综合医院',
                location: '上海市',
                departmentCount: 38,
                userCount: 980,
                status: 'active'
            },
            {
                id: 3,
                name: '广州中山医院',
                submitDate: '2024-01-13',
                description: '中山大学附属第一医院，是一所集医疗、教学、科研、预防、保健为一体的大型现代化综合性医院。',
                level: '三甲',
                type: '综合医院',
                location: '广东省',
                departmentCount: 42,
                userCount: 1100,
                status: 'active'
            },
            {
                id: 4,
                name: '四川华西医院',
                submitDate: '2024-01-12',
                description: '四川大学华西医院是一所集医疗、教学、科研、预防为一体的大型现代化综合性医院。',
                level: '三甲',
                type: '综合医院',
                location: '四川省',
                departmentCount: 48,
                userCount: 1350,
                status: 'active'
            },
            {
                id: 5,
                name: '浙江邵逸夫医院',
                submitDate: '2024-01-11',
                description: '浙江大学医学院附属邵逸夫医院是一所集医疗、教学、科研为一体的现代化综合性医院。',
                level: '三甲',
                type: '综合医院',
                location: '浙江省',
                departmentCount: 35,
                userCount: 890,
                status: 'active'
            },
            {
                id: 6,
                name: '天津医科大学总医院',
                submitDate: '2024-01-10',
                description: '天津市最大的综合性医院之一，是集医疗、教学、科研、预防为一体的现代化医院。',
                level: '三甲',
                type: '综合医院',
                location: '天津市',
                departmentCount: 40,
                userCount: 1020,
                status: 'active'
            }
        ];

        // 科室数据
        this.departments = [
            {
                id: 1,
                name: '心血管内科',
                hospitalId: 1,
                hospitalName: '北京协和医院',
                submitDate: '2024-01-15',
                description: '专业从事心血管疾病的诊断、治疗和预防，拥有先进的设备和专业的医疗团队。',
                director: '张主任',
                tags: ['心血管', '介入治疗', '冠心病'],
                projectCount: 12,
                memberCount: 28,
                status: 'active'
            },
            {
                id: 2,
                name: '肿瘤内科',
                hospitalId: 1,
                hospitalName: '北京协和医院',
                submitDate: '2024-01-14',
                description: '专注于各种恶性肿瘤的综合治疗，包括化疗、靶向治疗、免疫治疗等。',
                director: '李主任',
                tags: ['肿瘤', '化疗', '靶向治疗'],
                projectCount: 8,
                memberCount: 22,
                status: 'active'
            },
            {
                id: 3,
                name: '神经内科',
                hospitalId: 2,
                hospitalName: '上海瑞金医院',
                submitDate: '2024-01-13',
                description: '专业诊治各种神经系统疾病，包括脑血管病、癫痫、帕金森病等。',
                director: '王主任',
                tags: ['神经科', '脑血管', '癫痫'],
                projectCount: 15,
                memberCount: 32,
                status: 'active'
            },
            {
                id: 4,
                name: '消化内科',
                hospitalId: 2,
                hospitalName: '上海瑞金医院',
                submitDate: '2024-01-12',
                description: '专业从事消化系统疾病的诊断和治疗，包括内镜诊疗技术。',
                director: '陈主任',
                tags: ['消化科', '内镜', '胃肠疾病'],
                projectCount: 10,
                memberCount: 25,
                status: 'active'
            },
            {
                id: 5,
                name: '呼吸内科',
                hospitalId: 3,
                hospitalName: '广州中山医院',
                submitDate: '2024-01-11',
                description: '专业诊治呼吸系统疾病，包括肺炎、哮喘、慢阻肺等疾病。',
                director: '刘主任',
                tags: ['呼吸科', '肺部疾病', '哮喘'],
                projectCount: 9,
                memberCount: 20,
                status: 'active'
            },
            {
                id: 6,
                name: '骨科',
                hospitalId: 4,
                hospitalName: '四川华西医院',
                submitDate: '2024-01-10',
                description: '专业从事骨科疾病的诊断和治疗，包括创伤骨科、脊柱外科等。',
                director: '赵主任',
                tags: ['骨科', '创伤外科', '脊柱'],
                projectCount: 14,
                memberCount: 35,
                status: 'active'
            }
        ];

        // 课题数据
        this.projects = [
            {
                id: 1,
                title: '急性心肌梗死早期诊断与治疗策略研究',
                hospitalId: 1,
                hospitalName: '北京协和医院',
                departmentId: 1,
                departmentName: '心血管内科',
                leader: '张主任',
                status: 'ongoing',
                description: '针对急性心肌梗死患者的早期诊断标志物和治疗策略进行深入研究，旨在提高救治成功率。',
                tags: ['心血管', '急性心梗', '诊断标志物', '治疗策略'],
                createDate: '2024-01-10',
                memberCount: 8,
                budget: '50万',
                duration: '24个月',
                requirements: '心血管内科医师，有相关研究经验优先',
                contactInfo: 'zhang@hospital.com',
                isJoined: false,
                canJoin: false, // 需要认证
                canCreate: false // 需要认证
            },
            {
                id: 2,
                title: '肺癌靶向治疗耐药机制研究',
                hospitalId: 1,
                hospitalName: '北京协和医院',
                departmentId: 2,
                departmentName: '肿瘤内科',
                leader: '李主任',
                status: 'ongoing',
                description: '研究肺癌靶向治疗过程中出现的耐药机制，探索克服耐药的新策略。',
                tags: ['肿瘤', '肺癌', '靶向治疗', '耐药机制'],
                createDate: '2024-01-08',
                memberCount: 6,
                budget: '80万',
                duration: '36个月',
                requirements: '肿瘤内科医师，有靶向治疗经验',
                contactInfo: 'li@hospital.com',
                isJoined: false,
                canJoin: false,
                canCreate: false
            },
            {
                id: 3,
                title: '脑血管病介入治疗技术优化研究',
                hospitalId: 2,
                hospitalName: '上海瑞金医院',
                departmentId: 3,
                departmentName: '神经内科',
                leader: '王主任',
                status: 'recruiting',
                description: '优化脑血管病介入治疗技术，提高治疗效果，降低并发症发生率。',
                tags: ['神经科', '脑血管病', '介入治疗', '技术优化'],
                createDate: '2024-01-05',
                memberCount: 4,
                budget: '60万',
                duration: '30个月',
                requirements: '神经内科或介入科医师',
                contactInfo: 'wang@hospital.com',
                isJoined: false,
                canJoin: false,
                canCreate: false
            },
            {
                id: 4,
                title: '消化道早癌内镜诊治技术研究',
                hospitalId: 2,
                hospitalName: '上海瑞金医院',
                departmentId: 4,
                departmentName: '消化内科',
                leader: '陈主任',
                status: 'ongoing',
                description: '研究消化道早癌的内镜诊断和治疗技术，提高早癌检出率和治愈率。',
                tags: ['消化科', '早癌', '内镜技术', '诊治研究'],
                createDate: '2024-01-03',
                memberCount: 7,
                budget: '45万',
                duration: '24个月',
                requirements: '消化内科医师，有内镜操作经验',
                contactInfo: 'chen@hospital.com',
                isJoined: false,
                canJoin: false,
                canCreate: false
            },
            {
                id: 5,
                title: '慢性阻塞性肺疾病康复治疗研究',
                hospitalId: 3,
                hospitalName: '广州中山医院',
                departmentId: 5,
                departmentName: '呼吸内科',
                leader: '刘主任',
                status: 'planning',
                description: '研究慢性阻塞性肺疾病患者的康复治疗方案，改善患者生活质量。',
                tags: ['呼吸科', '慢阻肺', '康复治疗', '生活质量'],
                createDate: '2024-01-01',
                memberCount: 5,
                budget: '35万',
                duration: '18个月',
                requirements: '呼吸内科医师或康复治疗师',
                contactInfo: 'liu@hospital.com',
                isJoined: false,
                canJoin: false,
                canCreate: false
            },
            {
                id: 6,
                title: '脊柱微创手术技术改进研究',
                hospitalId: 4,
                hospitalName: '四川华西医院',
                departmentId: 6,
                departmentName: '骨科',
                leader: '赵主任',
                status: 'completed',
                description: '研究脊柱微创手术技术的改进方案，减少手术创伤，提高治疗效果。',
                tags: ['骨科', '脊柱外科', '微创手术', '技术改进'],
                createDate: '2023-06-01',
                memberCount: 10,
                budget: '70万',
                duration: '24个月',
                requirements: '骨科医师，有脊柱手术经验',
                contactInfo: 'zhao@hospital.com',
                isJoined: false,
                canJoin: false,
                canCreate: false
            }
        ];

        // 用户数据
        this.users = [
            {
                id: 1,
                name: '张医生',
                phone: '13800138001',
                email: 'zhang@example.com',
                hospitalId: 1,
                hospitalName: '北京协和医院',
                departmentId: 1,
                departmentName: '心血管内科',
                role: 'doctor',
                title: '主治医师',
                certificationStatus: 'verified',
                certificationDate: '2024-01-10',
                joinDate: '2023-12-01',
                avatar: null,
                isActive: true
            },
            {
                id: 2,
                name: '李研究员',
                phone: '13800138002',
                email: 'li@example.com',
                hospitalId: 1,
                hospitalName: '北京协和医院',
                departmentId: 2,
                departmentName: '肿瘤内科',
                role: 'researcher',
                title: '副研究员',
                certificationStatus: 'pending',
                certificationDate: null,
                joinDate: '2024-01-05',
                avatar: null,
                isActive: true
            }
        ];

        // 推送群数据
        this.pushGroups = [
            {
                id: 1,
                name: '心血管病 - 冠心病诊疗群',
                category: '心血管疾病',
                description: '专注于冠心病诊断标准、支架介入技术、抗血小板治疗、临床指南更新',
                departments: ['心外科', '心内科', '介入科'],
                memberCount: 245,
                tags: ['冠心病', '介入治疗', '支架技术', '临床指南'],
                isJoined: false,
                joinRequirement: '需要心血管相关科室认证',
                platform: '企业微信',
                qrCode: 'qr_code_1.jpg',
                status: 'active',
                createDate: '2024-01-01'
            },
            {
                id: 2,
                name: '肿瘤诊疗 - 实体瘤临床群',
                category: '肿瘤疾病',
                description: '涵盖肺癌、乳腺癌、结直肠癌诊疗、靶向药应用、化疗方案优化、多学科协作',
                departments: ['肿瘤科', '乳腺外科', '胃肠外科'],
                memberCount: 189,
                tags: ['实体瘤', '靶向治疗', '化疗方案', '多学科协作'],
                isJoined: false,
                joinRequirement: '需要肿瘤相关科室认证',
                platform: '微信群',
                qrCode: 'qr_code_2.jpg',
                status: 'active',
                createDate: '2023-12-15'
            }
        ];

        // 认证申请数据（管理端用）
        this.certifications = [
            {
                id: 1,
                userId: 2,
                userName: '李研究员',
                userPhone: '13800138002',
                hospitalName: '北京协和医院',
                departmentName: '肿瘤内科',
                certificateType: 'doctor',
                certificateNumber: 'MD202401001',
                certificateImages: ['cert1.jpg', 'cert2.jpg'],
                status: 'pending',
                submitDate: '2024-01-15 10:30',
                reviewDate: null,
                reviewer: null,
                reviewComment: null,
                expiryDate: '2025-12-31',
                ocrResult: {
                    name: '李研究员',
                    number: 'MD202401001',
                    hospital: '北京协和医院',
                    department: '肿瘤内科',
                    confidence: 0.95
                }
            },
            {
                id: 2,
                userId: 3,
                userName: '王护士',
                userPhone: '13800138003',
                hospitalName: '上海瑞金医院',
                departmentName: '神经内科',
                certificateType: 'nurse',
                certificateNumber: 'NR202401002',
                certificateImages: ['cert3.jpg'],
                status: 'approved',
                submitDate: '2024-01-14 15:20',
                reviewDate: '2024-01-15 09:15',
                reviewer: '管理员',
                reviewComment: '证件清晰，信息完整',
                expiryDate: '2024-12-31',
                ocrResult: {
                    name: '王护士',
                    number: 'NR202401002',
                    hospital: '上海瑞金医院',
                    department: '神经内科',
                    confidence: 0.88
                }
            }
        ];

        // 加群申请数据（管理端用）
        this.groupApplications = [
            {
                id: 1,
                userId: 2,
                userName: '李研究员',
                userPhone: '13800138002',
                hospitalName: '北京协和医院',
                departmentName: '肿瘤内科',
                groupId: 2,
                groupName: '肿瘤诊疗 - 实体瘤临床群',
                reason: '希望加入群组学习肿瘤诊疗新技术，分享临床经验',
                certificationStatus: 'pending',
                status: 'pending',
                submitDate: '2024-01-15 14:20',
                reviewDate: null,
                reviewer: null,
                reviewComment: null,
                riskLevel: 'low',
                applicationCount: 1
            }
        ];

        // 管理员数据
        this.admins = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123', // 实际项目中应该加密
                name: '系统管理员',
                role: 'super_admin',
                permissions: ['all'],
                email: 'admin@system.com',
                avatar: null,
                lastLogin: '2024-01-15 10:00',
                isActive: true
            }
        ];

        // 标签库数据
        this.tagLibrary = {
            '疾病相关': [
                '心血管疾病', '肿瘤疾病', '神经系统疾病', '消化系统疾病', '呼吸系统疾病',
                '内分泌疾病', '免疫系统疾病', '骨科疾病', '妇科疾病', '儿科疾病'
            ],
            '科研方向': [
                '基础研究', '临床研究', '流行病学', '药物研发', '医疗器械', '生物标志物',
                '基因治疗', '细胞治疗', '再生医学', '精准医学', '人工智能'
            ],
            '诊疗技术': [
                '微创手术', '介入治疗', '内镜技术', '影像诊断', '病理诊断', '分子诊断',
                '靶向治疗', '免疫治疗', '放射治疗', '康复治疗', '中医治疗'
            ],
            '人才培养': [
                '住院医师培训', '专科医师培训', '护理培训', '技能培训', '学术交流',
                '国际合作', '继续教育', '科研指导', '临床带教'
            ],
            '专科特色': [
                '多学科协作', '疑难病例', '罕见病', '急危重症', '慢性病管理',
                '健康管理', '预防医学', '老年医学', '儿童医学', '妇产医学'
            ],
            '学术成果': [
                'SCI论文', '核心期刊', '专利技术', '科研奖励', '学术会议',
                '指南制定', '专著出版', '临床试验', '产学研合作'
            ]
        };

        // 系统统计数据（管理端用）
        this.systemStats = {
            totalUsers: 2847,
            activeUsers: 2156,
            totalHospitals: 156,
            totalDepartments: 892,
            totalGroups: 245,
            activeGroups: 189,
            pendingCertifications: 12,
            pendingApplications: 8,
            todayRegistrations: 23,
            weeklyGrowth: 145,
            monthlyGrowth: 567
        };
    }

    // API模拟方法

    // 用户认证相关
    async login(credentials) {
        await this.delay(500);
        
        // 管理员登录
        if (credentials.username === 'admin' && credentials.password === 'admin123') {
            this.currentUser = this.admins[0];
            this.isLoggedIn = true;
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            localStorage.setItem('isLoggedIn', 'true');
            return { success: true, user: this.currentUser, isAdmin: true };
        }
        
        // 简化的用户登录 - 任何非空用户名密码都可以登录
        if (credentials.username && credentials.password) {
            // 查找现有用户或创建新用户
            let user = this.users.find(u => 
                u.email === credentials.username || 
                u.phone === credentials.username ||
                u.name === credentials.username
            );
            
            if (!user) {
                // 创建新用户
                user = {
                    id: this.users.length + 1,
                    name: credentials.username,
                    phone: credentials.username.includes('@') ? '' : credentials.username,
                    email: credentials.username.includes('@') ? credentials.username : '',
                    hospitalId: null,
                    hospitalName: '',
                    departmentId: null,
                    departmentName: '',
                    role: 'user',
                    title: '用户',
                    certificationStatus: 'unverified',
                    certificationDate: null,
                    joinDate: new Date().toISOString().split('T')[0],
                    avatar: null,
                    isActive: true
                };
                this.users.push(user);
            }
            
            this.currentUser = user;
            this.isLoggedIn = true;
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('isLoggedIn', 'true');
            return { success: true, user, isAdmin: false };
        }
        
        return { success: false, message: '请输入用户名和密码' };
    }

    async register(userData) {
        await this.delay(800);
        
        // 检查用户是否已存在
        const existingUser = this.users.find(u => 
            u.email === userData.email || u.phone === userData.phone
        );
        
        if (existingUser) {
            return { success: false, message: '用户已存在' };
        }
        
        const newUser = {
            id: this.users.length + 1,
            ...userData,
            certificationStatus: 'unverified',
            joinDate: new Date().toISOString().split('T')[0],
            isActive: true
        };
        
        this.users.push(newUser);
        return { success: true, user: newUser };
    }

    logout() {
        this.currentUser = null;
        this.isLoggedIn = false;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isLoggedIn');
    }

    getCurrentUser() {
        if (!this.currentUser) {
            const stored = localStorage.getItem('currentUser');
            if (stored) {
                this.currentUser = JSON.parse(stored);
                this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            }
        }
        return this.currentUser;
    }

    // 医院相关API
    async getHospitals(params = {}) {
        await this.delay(300);
        
        let hospitals = [...this.hospitals];
        
        // 搜索过滤
        if (params.search) {
            hospitals = hospitals.filter(h => 
                h.name.includes(params.search) ||
                h.description.includes(params.search)
            );
        }
        
        // 分页
        const page = params.page || 1;
        const pageSize = params.pageSize || 6;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        
        return {
            data: hospitals.slice(start, end),
            total: hospitals.length,
            page,
            pageSize,
            totalPages: Math.ceil(hospitals.length / pageSize)
        };
    }

    async getHospitalById(id) {
        await this.delay(200);
        const hospital = this.hospitals.find(h => h.id === parseInt(id));
        if (!hospital) {
            throw new Error('医院不存在');
        }
        return hospital;
    }

    // 科室相关API
    async getDepartments(params = {}) {
        await this.delay(300);
        
        let departments = [...this.departments];
        
        // 搜索过滤
        if (params.search) {
            departments = departments.filter(d => 
                d.name.includes(params.search) ||
                d.hospitalName.includes(params.search) ||
                d.description.includes(params.search)
            );
        }
        
        // 医院过滤
        if (params.hospitalId) {
            departments = departments.filter(d => d.hospitalId === parseInt(params.hospitalId));
        }
        
        // 分页
        const page = params.page || 1;
        const pageSize = params.pageSize || 6;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        
        return {
            data: departments.slice(start, end),
            total: departments.length,
            page,
            pageSize,
            totalPages: Math.ceil(departments.length / pageSize)
        };
    }

    async getDepartmentById(id) {
        await this.delay(200);
        const department = this.departments.find(d => d.id === parseInt(id));
        if (!department) {
            throw new Error('科室不存在');
        }
        return department;
    }

    // 课题相关API
    async getProjects(params = {}) {
        await this.delay(300);
        
        let projects = [...this.projects];
        
        // 搜索过滤
        if (params.search) {
            projects = projects.filter(p => 
                p.title.includes(params.search) ||
                p.leader.includes(params.search) ||
                p.description.includes(params.search)
            );
        }
        
        // 状态过滤
        if (params.status) {
            projects = projects.filter(p => p.status === params.status);
        }
        
        // 医院过滤
        if (params.hospitalId) {
            projects = projects.filter(p => p.hospitalId === parseInt(params.hospitalId));
        }
        
        // 科室过滤
        if (params.departmentId) {
            projects = projects.filter(p => p.departmentId === parseInt(params.departmentId));
        }
        
        // 分页
        const page = params.page || 1;
        const pageSize = params.pageSize || 6;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        
        return {
            data: projects.slice(start, end),
            total: projects.length,
            page,
            pageSize,
            totalPages: Math.ceil(projects.length / pageSize)
        };
    }

    async getProjectById(id) {
        await this.delay(200);
        const project = this.projects.find(p => p.id === parseInt(id));
        if (!project) {
            throw new Error('课题不存在');
        }
        return project;
    }

    async createProject(projectData) {
        await this.delay(800);
        
        if (!this.isLoggedIn) {
            throw new Error('请先登录');
        }
        
        if (this.currentUser.certificationStatus !== 'verified') {
            throw new Error('请先完成身份认证');
        }
        
        const newProject = {
            id: this.projects.length + 1,
            ...projectData,
            hospitalId: this.currentUser.hospitalId,
            hospitalName: this.currentUser.hospitalName,
            departmentId: this.currentUser.departmentId,
            departmentName: this.currentUser.departmentName,
            leader: this.currentUser.name,
            status: 'planning',
            createDate: new Date().toISOString().split('T')[0],
            memberCount: 1,
            isJoined: true,
            canJoin: true,
            canCreate: true
        };
        
        this.projects.unshift(newProject);
        return newProject;
    }

    async joinProject(projectId) {
        await this.delay(500);
        
        if (!this.isLoggedIn) {
            throw new Error('请先登录');
        }
        
        if (this.currentUser.certificationStatus !== 'verified') {
            throw new Error('请先完成身份认证');
        }
        
        const project = this.projects.find(p => p.id === parseInt(projectId));
        if (!project) {
            throw new Error('课题不存在');
        }
        
        project.isJoined = true;
        project.memberCount += 1;
        
        return { success: true, message: '加入课题成功' };
    }

    // 推送群相关API
    async getPushGroups(params = {}) {
        await this.delay(300);
        
        let groups = [...this.pushGroups];
        
        // 搜索过滤
        if (params.search) {
            groups = groups.filter(g => 
                g.name.includes(params.search) ||
                g.description.includes(params.search) ||
                g.category.includes(params.search)
            );
        }
        
        return {
            data: groups,
            total: groups.length
        };
    }

    async joinPushGroup(groupId) {
        await this.delay(500);
        
        if (!this.isLoggedIn) {
            throw new Error('请先登录');
        }
        
        if (this.currentUser.certificationStatus !== 'verified') {
            throw new Error('请先完成身份认证');
        }
        
        const group = this.pushGroups.find(g => g.id === parseInt(groupId));
        if (!group) {
            throw new Error('推送群不存在');
        }
        
        // 创建加群申请
        const application = {
            id: this.groupApplications.length + 1,
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            userPhone: this.currentUser.phone,
            hospitalName: this.currentUser.hospitalName,
            departmentName: this.currentUser.departmentName,
            groupId: group.id,
            groupName: group.name,
            reason: '希望获取相关领域的最新资讯',
            certificationStatus: this.currentUser.certificationStatus,
            status: 'pending',
            submitDate: new Date().toLocaleString(),
            reviewDate: null,
            reviewer: null,
            reviewComment: null,
            riskLevel: 'low',
            applicationCount: 1
        };
        
        this.groupApplications.push(application);
        
        return { success: true, message: '申请已提交，请等待审核' };
    }

    // 认证相关API
    async submitCertification(certData) {
        await this.delay(1000);
        
        if (!this.isLoggedIn) {
            throw new Error('请先登录');
        }
        
        const certification = {
            id: this.certifications.length + 1,
            userId: this.currentUser.id,
            userName: this.currentUser.name,
            userPhone: this.currentUser.phone,
            ...certData,
            status: 'pending',
            submitDate: new Date().toLocaleString(),
            reviewDate: null,
            reviewer: null,
            reviewComment: null,
            ocrResult: {
                name: this.currentUser.name,
                confidence: 0.85
            }
        };
        
        this.certifications.push(certification);
        
        // 更新用户状态
        this.currentUser.certificationStatus = 'pending';
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex].certificationStatus = 'pending';
        }
        
        return { success: true, message: '认证申请已提交' };
    }

    // 标签相关API
    async getTagLibrary() {
        await this.delay(200);
        return this.tagLibrary;
    }

    // 管理端API
    async getSystemStats() {
        await this.delay(300);
        return this.systemStats;
    }

    async getCertifications(params = {}) {
        await this.delay(300);
        
        let certifications = [...this.certifications];
        
        // 状态过滤
        if (params.status) {
            certifications = certifications.filter(c => c.status === params.status);
        }
        
        // 搜索过滤
        if (params.search) {
            certifications = certifications.filter(c => 
                c.userName.includes(params.search) ||
                c.userPhone.includes(params.search) ||
                c.hospitalName.includes(params.search)
            );
        }
        
        // 分页
        const page = params.page || 1;
        const pageSize = params.pageSize || 10;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        
        return {
            data: certifications.slice(start, end),
            total: certifications.length,
            page,
            pageSize,
            totalPages: Math.ceil(certifications.length / pageSize)
        };
    }

    async approveCertification(certId, comment = '') {
        await this.delay(500);
        
        const cert = this.certifications.find(c => c.id === parseInt(certId));
        if (!cert) {
            throw new Error('认证记录不存在');
        }
        
        cert.status = 'approved';
        cert.reviewDate = new Date().toLocaleString();
        cert.reviewer = '管理员';
        cert.reviewComment = comment || '审核通过';
        
        // 更新用户状态
        const user = this.users.find(u => u.id === cert.userId);
        if (user) {
            user.certificationStatus = 'verified';
            user.certificationDate = new Date().toISOString().split('T')[0];
        }
        
        return { success: true, message: '审核通过' };
    }

    async rejectCertification(certId, reason) {
        await this.delay(500);
        
        const cert = this.certifications.find(c => c.id === parseInt(certId));
        if (!cert) {
            throw new Error('认证记录不存在');
        }
        
        cert.status = 'rejected';
        cert.reviewDate = new Date().toLocaleString();
        cert.reviewer = '管理员';
        cert.reviewComment = reason;
        
        // 更新用户状态
        const user = this.users.find(u => u.id === cert.userId);
        if (user) {
            user.certificationStatus = 'rejected';
        }
        
        return { success: true, message: '已拒绝' };
    }

    async getGroupApplications(params = {}) {
        await this.delay(300);
        
        let applications = [...this.groupApplications];
        
        // 状态过滤
        if (params.status) {
            applications = applications.filter(a => a.status === params.status);
        }
        
        // 搜索过滤
        if (params.search) {
            applications = applications.filter(a => 
                a.userName.includes(params.search) ||
                a.groupName.includes(params.search)
            );
        }
        
        return {
            data: applications,
            total: applications.length
        };
    }

    async approveGroupApplication(appId, comment = '') {
        await this.delay(500);
        
        const app = this.groupApplications.find(a => a.id === parseInt(appId));
        if (!app) {
            throw new Error('申请记录不存在');
        }
        
        app.status = 'approved';
        app.reviewDate = new Date().toLocaleString();
        app.reviewer = '管理员';
        app.reviewComment = comment || '审核通过';
        
        // 更新推送群成员数
        const group = this.pushGroups.find(g => g.id === app.groupId);
        if (group) {
            group.memberCount += 1;
        }
        
        return { success: true, message: '审核通过' };
    }

    async rejectGroupApplication(appId, reason) {
        await this.delay(500);
        
        const app = this.groupApplications.find(a => a.id === parseInt(appId));
        if (!app) {
            throw new Error('申请记录不存在');
        }
        
        app.status = 'rejected';
        app.reviewDate = new Date().toLocaleString();
        app.reviewer = '管理员';
        app.reviewComment = reason;
        
        return { success: true, message: '已拒绝' };
    }

    // 工具方法
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 数据导出
    exportData(type, data) {
        const filename = `${type}_${new Date().toISOString().split('T')[0]}.json`;
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// 创建全局数据服务实例
window.dataService = new DataService();