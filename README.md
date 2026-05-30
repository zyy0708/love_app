# 💕 情侣日记 (Couple Diary)

一个专为情侣设计的私密日记应用，记录你们一起的每一刻。

## ✨ 功能特性

### 📝 日记系统
- 创建、编辑、删除日记条目
- 支持文字和图片
- 6种心情标签：😊 开心、😢 难过、😠 生气、😐 平静、😍 热恋、🤩 兴奋
- 按时间倒序展示

### 🎉 纪念日管理
- 重要日期提醒
- 倒计时显示

### 🤖 AI 智能总结
- 自动生成周/月/年度回忆总结
- 分析你们的感情状态

### 👫 情侣绑定
- 通过邮箱邀请另一半
- 生成绑定码完成配对
- 安全的绑定码机制（24小时过期）

### 📺 时间线
- 查看所有互动记录
- 类似朋友圈的时间线展示

## 🛡️ 安全特性

### 已实现的安全措施
- ✅ **强密码要求**：至少8位，包含大小写字母和数字
- ✅ **JWT 认证**：2小时过期时间
- ✅ **管理员权限**：Admin 端点需要管理员角色
- ✅ **参数化查询**：使用 sql.js 原生参数化查询防止 SQL 注入
- ✅ **事务支持**：关键操作使用事务确保数据一致性
- ✅ **输入验证**：所有用户输入都经过验证和清理
- ✅ **CORS 配置**：生产环境限制允许的来源
- ✅ **速率限制**：防止暴力攻击
- ✅ **数据库索引**：优化查询性能

### 安全审计结果
项目已经过全面安全审计，修复了以下问题：
1. JWT 密钥已更换为加密安全的随机密钥
2. Admin 端点添加了管理员权限检查
3. SQL 查询使用原生参数化查询
4. 添加了数据库事务支持
5. 优化了 CORS 配置
6. 增强了密码强度要求

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- npm 或 yarn

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd love_app
```

2. **安装后端依赖**
```bash
cd backend
npm install
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，配置以下变量：
# - PORT: 服务器端口（默认3000）
# - DB_PATH: 数据库文件路径
# - JWT_SECRET: JWT 密钥（已自动生成）
# - ALLOWED_ORIGINS: 允许的前端来源
```

4. **安装前端依赖**
```bash
cd ../frontend
npm install
```

5. **启动开发服务器**

后端：
```bash
cd backend
npm run dev
```

前端：
```bash
cd frontend
npm run dev
```

6. **访问应用**
- 前端：http://localhost:5173
- 后端 API：http://localhost:3000

## 📁 项目结构

```
love_app/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── config/         # 配置文件
│   │   │   ├── db.js      # 数据库连接和操作
│   │   │   └── env.js     # 环境变量配置
│   │   ├── controllers/    # 控制器
│   │   │   ├── adminController.js  # 管理员操作
│   │   │   ├── diaryController.js  # 日记操作
│   │   │   └── userController.js   # 用户操作
│   │   ├── middleware/     # 中间件
│   │   │   ├── admin.js   # 管理员权限检查
│   │   │   └── auth.js    # JWT 认证
│   │   ├── models/         # 数据模型
│   │   │   ├── ai.js      # AI 总结模型
│   │   │   ├── diary.js   # 日记模型
│   │   │   └── user.js    # 用户模型
│   │   ├── routes/         # 路由定义
│   │   │   ├── diaryRoutes.js  # 日记路由
│   │   │   └── userRoutes.js   # 用户路由
│   │   ├── utils/          # 工具函数
│   │   │   ├── auth.js    # 认证工具
│   │   │   ├── logger.js  # 日志工具
│   │   │   └── validation.js  # 验证工具
│   │   └── server.js       # 服务器入口
│   ├── data/               # 数据库文件
│   ├── uploads/            # 上传文件
│   └── package.json
├── frontend/                # 前端应用
│   ├── src/
│   │   ├── views/          # 页面组件
│   │   │   ├── Home.vue           # 首页
│   │   │   ├── Login.vue          # 登录页
│   │   │   ├── Register.vue       # 注册页
│   │   │   ├── Dashboard.vue      # 仪表板
│   │   │   ├── DiaryEditor.vue    # 日记编辑器
│   │   │   ├── Timeline.vue       # 时间线
│   │   │   └── CoupleBinding.vue  # 情侣绑定
│   │   ├── stores/         # Pinia 状态管理
│   │   │   ├── auth.js    # 认证状态
│   │   │   └── diary.js   # 日记状态
│   │   ├── services/       # API 服务
│   │   │   ├── api.js     # API 客户端
│   │   │   └── index.js   # 服务导出
│   │   ├── router/         # 路由配置
│   │   │   └── index.js
│   │   ├── App.vue         # 根组件
│   │   └── main.js         # 入口文件
│   └── package.json
└── README.md
```

## 🔧 API 文档

### 认证相关

#### POST /api/users/register
注册新用户

**请求体：**
```json
{
  "username": "string (2-30字符)",
  "email": "string (有效邮箱)",
  "password": "string (至少8位，包含大小写字母和数字)"
}
```

**响应：**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

#### POST /api/users/login
用户登录

**请求体：**
```json
{
  "email": "string",
  "password": "string"
}
```

**响应：**
```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

### 日记相关

#### GET /api/diary
获取日记列表

**请求头：**
```
Authorization: Bearer <token>
```

**查询参数：**
- `limit`: 每页数量（默认20）
- `offset`: 偏移量（默认0）

#### POST /api/diary
创建日记

**请求体：**
```json
{
  "title": "string (可选)",
  "content": "string (必填)",
  "mood": "happy|sad|angry|neutral|loved|excited",
  "images": ["string"] // 图片URL数组
}
```

### 情侣相关

#### POST /api/users/couple/initialize
创建情侣关系

**请求体：**
```json
{
  "user2Email": "string (另一半的邮箱)"
}
```

#### POST /api/users/couple/bind
绑定情侣关系

**请求体：**
```json
{
  "bindCode": "string (6-8位绑定码)"
}
```

## 🎨 前端设计

### 设计理念
- **温馨浪漫**：粉色系配色，圆润的卡片设计
- **现代简洁**：毛玻璃效果，流畅的动画
- **响应式设计**：适配各种屏幕尺寸
- **优秀交互**：悬停效果，加载动画

### 技术栈
- **Vue 3**：Composition API
- **Vite**：快速构建工具
- **Tailwind CSS**：原子化 CSS
- **Pinia**：状态管理
- **Vue Router**：路由管理

## 📊 数据库设计

### 表结构

#### users 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| username | TEXT | 用户名 |
| email | TEXT | 邮箱 |
| password_hash | TEXT | 密码哈希 |
| avatar_url | TEXT | 头像URL |
| is_admin | INTEGER | 是否管理员 |
| created_at | DATETIME | 创建时间 |

#### couples 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| user1_id | INTEGER | 用户1 ID |
| user2_id | INTEGER | 用户2 ID |
| bind_code | TEXT | 绑定码 |
| bind_code_expires_at | DATETIME | 绑定码过期时间 |
| is_bound | INTEGER | 是否已绑定 |
| bound_at | DATETIME | 绑定时间 |
| anniversary | DATE | 纪念日 |

#### diary_entries 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键 |
| couple_id | INTEGER | 情侣 ID |
| author_id | INTEGER | 作者 ID |
| title | TEXT | 标题 |
| content | TEXT | 内容 |
| mood | TEXT | 心情 |
| images | TEXT | 图片JSON |
| ai_summary | TEXT | AI总结 |
| created_at | DATETIME | 创建时间 |

### 索引优化
- `idx_diary_couple_created`: 加速按情侣查询日记
- `idx_timeline_entry_id`: 加速时间线删除
- `idx_couples_is_bound`: 加速绑定状态查询

## 🚀 部署

### 生产环境配置

1. **设置环境变量**
```bash
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
ALLOWED_ORIGINS=https://yourdomain.com
```

2. **构建前端**
```bash
cd frontend
npm run build
```

3. **启动服务**
```bash
cd backend
npm start
```

### Railway 部署
项目已配置 `railway.json`，可直接部署到 Railway。

### Vercel 部署
前端可部署到 Vercel，后端需要单独部署。

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📝 更新日志

### v2.0.0 (2026-05-30)
- 🔒 安全审计和修复
  - 更换 JWT 密钥为加密安全的随机密钥
  - 添加管理员权限检查
  - 使用原生参数化查询
  - 添加事务支持
- 🎨 前端设计改进
  - 全新的首页设计
  - 改进的登录/注册页面
  - 优化的仪表板布局
- 📊 数据库优化
  - 添加缺失的索引
  - 优化查询性能
- 📚 文档更新
  - 完整的 API 文档
  - 详细的部署指南

### v1.0.0 (2026-05-29)
- 🎉 初始版本发布
- 📝 日记系统
- 👫 情侣绑定
- 🤖 AI 总结
- 📺 时间线

## 📄 许可证

MIT License

## 💕 致谢

感谢所有为这个项目做出贡献的人！

---

**用爱记录，用心珍藏** 💕
