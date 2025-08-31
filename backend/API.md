# 科研资讯推送管理系统 API 文档

## 基本信息

- **基础URL**: `http://localhost:3000/api`
- **认证方式**: Bearer Token (JWT)
- **内容类型**: `application/json`

## 认证说明

大部分接口需要在请求头中包含认证Token：
```
Authorization: Bearer <your_jwt_token>
```

## 响应格式

所有API响应都使用统一格式：

```json
{
  "success": true/false,
  "message": "响应消息",
  "data": {
    // 具体数据
  },
  "errors": [
    // 验证错误数组（仅在验证失败时存在）
  ]
}
```

## API 接口

### 1. 用户认证 (`/api/auth`)

#### 1.1 用户注册
- **URL**: `POST /api/auth/register`
- **权限**: 公开
- **描述**: 新用户注册

**请求体**:
```json
{
  "name": "张三",
  "phone": "13888888888",
  "email": "zhangsan@example.com",
  "password": "123456"
}
```

**响应**:
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "id": 1,
      "username": "user_1234567890",
      "email": "zhangsan@example.com",
      "role": "user",
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 1.2 用户登录
- **URL**: `POST /api/auth/login`
- **权限**: 公开
- **描述**: 用户登录

**请求体**:
```json
{
  "username": "user_1234567890",
  "password": "123456"
}
```

**响应**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "user_1234567890",
      "email": "zhangsan@example.com",
      "role": "user",
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 1.3 获取用户信息
- **URL**: `GET /api/auth/me`
- **权限**: 需要登录
- **描述**: 获取当前用户信息

**响应**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "user_1234567890",
      "email": "zhangsan@example.com",
      "role": "user",
      "status": "active",
      "profile": {
        "real_name": "张三",
        "title": "主治医师",
        "phone": "13888888888",
        "hospital": {
          "id": 1,
          "name": "北京协和医院"
        },
        "department": {
          "id": 1,
          "name": "内科"
        }
      }
    }
  }
}
```

#### 1.4 更新用户资料
- **URL**: `PUT /api/auth/profile`
- **权限**: 需要登录
- **描述**: 更新用户资料信息

**请求体**:
```json
{
  "real_name": "张三",
  "title": "主治医师",
  "phone": "13888888888",
  "hospital_id": 1,
  "department_id": 1,
  "bio": "个人简介"
}
```

#### 1.5 修改密码
- **URL**: `PUT /api/auth/change-password`
- **权限**: 需要登录
- **描述**: 修改用户密码

**请求体**:
```json
{
  "current_password": "123456",
  "new_password": "654321"
}
```

### 2. 医院管理 (`/api/hospitals`)

#### 2.1 获取医院列表
- **URL**: `GET /api/hospitals`
- **权限**: 公开
- **描述**: 获取医院列表，支持分页和搜索

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10, 最大: 100)
- `search`: 搜索关键词
- `level`: 医院等级筛选
- `type`: 医院类型筛选
- `location`: 地区筛选

**响应**:
```json
{
  "success": true,
  "data": {
    "hospitals": [
      {
        "id": 1,
        "name": "北京协和医院",
        "level": "三甲",
        "type": "综合医院",
        "location": "北京市",
        "address": "北京市东城区王府井帅府园1号",
        "phone": "010-69156114",
        "website": "https://www.pumch.cn",
        "department_count": 45,
        "created_at": "2023-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_count": 100,
      "per_page": 10
    }
  }
}
```

#### 2.2 获取医院详情
- **URL**: `GET /api/hospitals/:id`
- **权限**: 公开
- **描述**: 获取指定医院的详细信息

#### 2.3 创建医院（管理员）
- **URL**: `POST /api/hospitals`
- **权限**: 管理员
- **描述**: 创建新医院

**请求体**:
```json
{
  "name": "北京协和医院",
  "level": "三甲",
  "type": "综合医院",
  "location": "北京市",
  "address": "北京市东城区王府井帅府园1号",
  "phone": "010-69156114",
  "website": "https://www.pumch.cn",
  "description": "医院简介"
}
```

#### 2.4 更新医院信息（管理员）
- **URL**: `PUT /api/hospitals/:id`
- **权限**: 管理员

#### 2.5 删除医院（管理员）
- **URL**: `DELETE /api/hospitals/:id`
- **权限**: 管理员

### 3. 科室管理 (`/api/departments`)

#### 3.1 获取科室列表
- **URL**: `GET /api/departments`
- **权限**: 公开
- **描述**: 获取科室列表，支持分页和搜索

**查询参数**:
- `page`: 页码
- `limit`: 每页数量
- `search`: 搜索关键词
- `hospital_id`: 医院ID筛选
- `status`: 状态筛选

#### 3.2 根据医院获取科室
- **URL**: `GET /api/departments/hospital/:hospital_id`
- **权限**: 公开
- **描述**: 获取指定医院下的所有科室

#### 3.3 获取科室详情
- **URL**: `GET /api/departments/:id`
- **权限**: 公开

#### 3.4 获取科室统计信息
- **URL**: `GET /api/departments/stats`
- **权限**: 公开

#### 3.5 创建科室（管理员）
- **URL**: `POST /api/departments`
- **权限**: 管理员

**请求体**:
```json
{
  "name": "内科",
  "hospital_id": 1,
  "director": "李主任",
  "description": "科室简介",
  "specialties": ["心内科", "消化内科", "呼吸内科"]
}
```

#### 3.6 更新科室信息（管理员）
- **URL**: `PUT /api/departments/:id`
- **权限**: 管理员

#### 3.7 删除科室（管理员）
- **URL**: `DELETE /api/departments/:id`
- **权限**: 管理员

### 4. 课题管理 (`/api/projects`)

#### 4.1 获取课题列表
- **URL**: `GET /api/projects`
- **权限**: 公开
- **描述**: 获取课题列表

**查询参数**:
- `page`: 页码
- `limit`: 每页数量
- `search`: 搜索关键词
- `type`: 课题类型
- `status`: 课题状态
- `hospital_id`: 医院ID
- `department_id`: 科室ID
- `sort_by`: 排序字段
- `sort_order`: 排序方向

#### 4.2 获取我的课题列表
- **URL**: `GET /api/projects/my`
- **权限**: 需要登录
- **描述**: 获取当前用户参与的课题

**查询参数**:
- `role`: 角色筛选 (leader/member/all)
- `status`: 状态筛选

#### 4.3 获取课题统计
- **URL**: `GET /api/projects/stats`
- **权限**: 公开

#### 4.4 获取课题详情
- **URL**: `GET /api/projects/:id`
- **权限**: 公开

#### 4.5 创建课题
- **URL**: `POST /api/projects`
- **权限**: 需要登录

**请求体**:
```json
{
  "title": "基于深度学习的医学影像诊断研究",
  "description": "课题详细描述...",
  "type": "临床研究",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "budget": 100000,
  "keywords": ["深度学习", "医学影像", "诊断"],
  "objectives": ["目标1", "目标2", "目标3"]
}
```

#### 4.6 更新课题信息
- **URL**: `PUT /api/projects/:id`
- **权限**: 课题负责人或管理员

#### 4.7 删除课题
- **URL**: `DELETE /api/projects/:id`
- **权限**: 课题负责人或管理员

#### 4.8 添加课题成员
- **URL**: `POST /api/projects/:id/members`
- **权限**: 课题负责人

**请求体**:
```json
{
  "user_id": 2,
  "role": "member"
}
```

#### 4.9 移除课题成员
- **URL**: `DELETE /api/projects/:id/members/:user_id`
- **权限**: 课题负责人

### 5. 管理员接口 (`/api/admin`)

所有管理员接口都需要管理员权限。

#### 5.1 管理后台仪表盘
- **URL**: `GET /api/admin/dashboard`
- **权限**: 管理员
- **描述**: 获取管理后台统计数据

#### 5.2 用户管理
- **获取用户列表**: `GET /api/admin/users`
- **获取用户详情**: `GET /api/admin/users/:id`  
- **更新用户状态**: `PUT /api/admin/users/:id/status`

#### 5.3 认证审核
- **获取认证申请**: `GET /api/admin/certifications`
- **审核认证申请**: `PUT /api/admin/certifications/:id/review`

**审核请求体**:
```json
{
  "status": "approved", // approved/rejected
  "review_note": "审核意见"
}
```

#### 5.4 课题管理
- **获取所有课题**: `GET /api/admin/projects`
- **更新课题状态**: `PUT /api/admin/projects/:id/status`

#### 5.5 医院/科室管理
- **获取医院列表**: `GET /api/admin/hospitals`
- **更新医院状态**: `PUT /api/admin/hospitals/:id/status`
- **获取科室列表**: `GET /api/admin/departments`

#### 5.6 系统统计
- **系统日志**: `GET /api/admin/logs`
- **统计信息**: `GET /api/admin/stats`

### 6. 文件上传 (`/api/upload`)

#### 6.1 上传单个图片
- **URL**: `POST /api/upload/image`
- **权限**: 需要登录
- **Content-Type**: `multipart/form-data`
- **字段名**: `image`
- **支持格式**: jpg, jpeg, png, gif, webp
- **大小限制**: 10MB

#### 6.2 上传多个图片
- **URL**: `POST /api/upload/images`
- **权限**: 需要登录
- **字段名**: `images`
- **数量限制**: 5个文件

#### 6.3 上传文档
- **URL**: `POST /api/upload/document`
- **权限**: 需要登录
- **字段名**: `document`
- **支持格式**: pdf, doc, docx, xls, xlsx, ppt, pptx, txt

#### 6.4 上传多个文档
- **URL**: `POST /api/upload/documents`
- **权限**: 需要登录
- **字段名**: `documents`
- **数量限制**: 3个文件

#### 6.5 上传认证材料
- **URL**: `POST /api/upload/certification`
- **权限**: 需要登录
- **字段名**: `certification`
- **限制**: 仅支持图片格式

**上传响应示例**:
```json
{
  "success": true,
  "message": "文件上传成功",
  "data": {
    "file": {
      "original_name": "avatar.jpg",
      "filename": "1640995200000-abc123-avatar.jpg",
      "size": 204800,
      "mimetype": "image/jpeg",
      "relative_path": "images/1640995200000-abc123-avatar.jpg",
      "url": "http://localhost:3000/uploads/images/1640995200000-abc123-avatar.jpg"
    }
  }
}
```

#### 6.6 删除文件
- **URL**: `DELETE /api/upload/:filename`
- **权限**: 需要登录

#### 6.7 获取文件信息
- **URL**: `GET /api/upload/:filename`
- **权限**: 公开

### 7. 用户管理 (`/api/users`)

#### 7.1 获取用户列表（管理员）
- **URL**: `GET /api/users`
- **权限**: 管理员
- **描述**: 获取用户列表

## 错误代码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

## 数据类型说明

### 用户角色
- `user`: 普通用户
- `admin`: 管理员
- `super_admin`: 超级管理员

### 用户状态
- `active`: 激活
- `inactive`: 未激活
- `banned`: 已封禁

### 课题类型
- `临床研究`: 临床研究
- `基础研究`: 基础研究
- `转化研究`: 转化研究
- `教学研究`: 教学研究
- `管理研究`: 管理研究
- `其他`: 其他

### 课题状态
- `active`: 进行中
- `completed`: 已完成
- `paused`: 暂停
- `cancelled`: 已取消

### 医院等级
- `三甲`, `三乙`, `二甲`, `二乙`, `一甲`, `一乙`, `其他`

### 医院类型
- `综合医院`, `专科医院`, `中医医院`, `妇幼保健院`, `其他`

## 开发说明

### 启动项目
```bash
# 安装依赖
npm install

# 初始化数据库
npm run init-db

# 开发环境启动
npm run dev

# 生产环境启动
npm start
```

### 环境变量
创建 `.env` 文件：
```env
PORT=3000
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
DB_PATH=./database/app.db
CORS_ORIGIN=http://localhost:8000
NODE_ENV=development
```

### 数据库
项目使用SQLite数据库，数据文件位于 `backend/database/app.db`。

### 日志
日志文件位于 `backend/logs/` 目录下。

### 文件存储
上传的文件存储在 `backend/uploads/` 目录下，通过 `/uploads/` 路径访问。

## 注意事项

1. 所有需要认证的接口都要在请求头中携带有效的JWT Token
2. 文件上传接口需要使用 `multipart/form-data` 格式
3. 分页参数中，`page` 从1开始，`limit` 最大值为100
4. 搜索功能支持模糊匹配
5. 所有时间字段都使用ISO8601格式 (YYYY-MM-DDTHH:mm:ss.sssZ)
6. 接口有频率限制，每个IP每15分钟最多1000次请求

## 更新日志

- **v1.0.0**: 初始版本，包含基础的用户认证、医院科室、课题管理、管理员后台和文件上传功能