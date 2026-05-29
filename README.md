# 情侣记录系统（Couple Diary App）

## 📋 项目概述

一个完整的全栈情侣日记应用，用于记录两个人的故事、照片、心情和重要时刻。支持AI生成回忆总结、纪念日倒计时等功能。

## ✨ 核心功能

- **👥 情侣配对**: 通过邀请码进行安全配对
- **📝 日记系统**: 支持文本、图片、心情记录
- **🎉 纪念日管理**: 倒计时重要日期
- **📺 时间线**: 浏览所有共同回忆的时间线
- **🤖 AI总结**: 自动生成周/月/年度总结
- **🔐 数据安全**: JWT认证、隐私保护

## 🏗️ 技术栈

### 前端
- Vue 3（组合式API）
- Vite 4
- Tailwind CSS 3
- Pinia 2（状态管理）
- Vue Router 4（路由）
- Axios（HTTP 请求）
- date-fns（日期格式化）

### 后端
- Node.js + Express 4
- sql.js（SQLite WebAssembly）
- JWT 认证（jsonwebtoken）
- bcryptjs（密码加密）
- Multer（文件上传）
- Joi 风格参数校验

## 📦 项目结构

```
love_app/
├── backend/              # 后端应用
│   ├── src/
│   │   ├── config/      # 配置文件（db.js, env.js）
│   │   ├── controllers/ # 业务逻辑
│   │   ├── models/      # 数据模型
│   │   ├── routes/      # API路由
│   │   ├── middleware/  # 中间件（auth, couple）
│   │   ├── utils/       # 工具函数
│   │   ├── db/          # 数据库迁移
│   │   └── server.js    # 主服务器文件
│   ├── data/            # SQLite 数据库文件
│   ├── uploads/         # 上传文件夹
│   ├── package.json
│   └── .env.example
│
├── frontend/            # 前端应用
│   ├── src/
│   │   ├── views/       # 页面视图
│   │   ├── stores/      # Pinia状态管理
│   │   ├── services/    # API服务
│   │   ├── router/      # 路由配置
│   │   ├── App.vue      # 根组件
│   │   ├── main.js      # 入口文件
│   │   └── style.css    # 全局样式
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── docs/                # 项目文档
└── README.md
```

## 🚀 快速开始

### 前置要求
- Node.js >= 16

### 1. 后端设置

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，设置 JWT_SECRET（至少16个字符）

# 启动服务器
npm run dev
```

后端将运行在 `http://localhost:3000`，数据库会在首次启动时自动创建。

### 2. 前端设置

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将运行在 `http://localhost:5173`，自动代理 `/api` 请求到后端。

## 🗄️ 数据库说明

本项目使用 **SQLite**（通过 sql.js WebAssembly 引擎），无需安装任何数据库服务。数据库文件存储在 `backend/data/couple_diary.db`，首次启动时自动创建。

### 数据库表结构

| 表名 | 说明 |
|------|------|
| users | 用户信息 |
| couples | 情侣关系 |
| diary_entries | 日记条目 |
| timeline_feed | 时间线事件 |
| ai_summaries | AI 生成的总结 |

### 配置 .env 文件

```env
PORT=3000
NODE_ENV=development
DB_PATH=./data/couple_diary.db
JWT_SECRET=your_secret_key_at_least_16_chars
ALLOWED_ORIGINS=http://localhost:5173
```

## 📖 API 文档

### 用户相关

#### 注册
```
POST /api/users/register
Content-Type: application/json

{
  "username": "张三",
  "email": "zhangsan@example.com",
  "password": "password123"
}
```

#### 登录
```
POST /api/users/login
{
  "email": "zhangsan@example.com",
  "password": "password123"
}

Response:
{
  "id": 1,
  "username": "张三",
  "email": "zhangsan@example.com",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 获取个人资料
```
GET /api/users/profile
Authorization: Bearer {token}
```

### 情侣相关

#### 初始化情侣关系
```
POST /api/users/couple/initialize
Authorization: Bearer {token}
{
  "user2Email": "lisi@example.com"
}

Response:
{
  "message": "Couple created...",
  "bindCode": "A1B2C3D4",
  "expiresAt": "2024-05-30T10:00:00Z"
}
```

#### 绑定情侣
```
POST /api/users/couple/bind
Authorization: Bearer {token}
{
  "bindCode": "A1B2C3D4"
}
```

#### 获取配对伴侣信息
```
GET /api/users/couple
Authorization: Bearer {token}
```

### 日记相关

#### 创建日记
```
POST /api/diary
Authorization: Bearer {token}
{
  "title": "我们的约会",
  "content": "今天在咖啡馆度过了美好的午后...",
  "mood": "happy",
  "images": ["base64_encoded_image_1", "base64_encoded_image_2"]
}
```

#### 获取日记列表
```
GET /api/diary?limit=20&offset=0
Authorization: Bearer {token}
```

#### 获取单个日记
```
GET /api/diary/:entryId
Authorization: Bearer {token}
```

#### 更新日记
```
PUT /api/diary/:entryId
Authorization: Bearer {token}
{
  "title": "修改标题",
  "content": "修改内容",
  "mood": "loved",
  "images": []
}
```

#### 删除日记
```
DELETE /api/diary/:entryId
Authorization: Bearer {token}
```

#### 获取时间线
```
GET /api/diary/timeline?limit=30&offset=0
Authorization: Bearer {token}
```

#### 获取AI总结
```
GET /api/diary/ai-summary?period=week
Authorization: Bearer {token}

period: 'week' | 'month' | 'year'
```

### 管理接口（需要认证）

#### 查看数据库信息
```
GET /api/users/admin/db-info
Authorization: Bearer {token}
```

#### 清空数据库
```
POST /api/users/admin/clear-db
Authorization: Bearer {token}
```

## 🎨 页面说明

| 页面 | 路由 | 功能 |
|-----|------|------|
| 首页 | `/` | 产品介绍 |
| 登录 | `/login` | 用户登录 |
| 注册 | `/register` | 创建新账户 |
| 配对 | `/couple-binding` | 情侣配对 |
| 仪表板 | `/dashboard` | 日记列表和AI总结 |
| 日记编辑 | `/diary/new` | 创建新日记 |
| 日记编辑 | `/diary/:id` | 编辑已有日记 |
| 时间线 | `/timeline` | 浏览事件时间线 |

## 🔐 安全特性

- ✅ JWT Token 认证（30天有效期）
- ✅ 密码哈希加密（bcryptjs）
- ✅ 数据隐私隔离（情侣之间）
- ✅ 管理员接口认证保护
- ✅ CORS 白名单配置
- ✅ 请求速率限制（通用 100/15min，认证 10/15min）
- ✅ 邀请码使用 crypto 安全生成
- ✅ 防止自绑定和重复配对
- ✅ 前端 401 拦截器自动处理过期 token

## 📱 使用流程

1. **注册账户** - 创建个人账户
2. **生成配对码** - 生成24小时有效的邀请码
3. **分享配对码** - 将码分享给伴侣
4. **完成配对** - 伴侣输入码完成配对
5. **开始记录** - 创建日记、上传照片、选择心情
6. **查看总结** - 查看AI生成的回忆总结
7. **浏览时间线** - 回顾所有重要时刻

## 🛠️ 开发指南

### 添加新API端点

1. 在 `controllers/` 中创建控制器函数
2. 在 `models/` 中添加数据库操作
3. 在 `routes/` 中定义路由
4. 在 `frontend/services/` 中添加API调用

### 添加新页面

1. 在 `frontend/src/views/` 中创建 `.vue` 文件
2. 在 `router/index.js` 中添加路由
3. 使用 `useAuthStore` 和 `useDiaryStore` 管理状态

## 🐛 故障排除

### 401未授权错误
- 检查token是否存储在localStorage
- 验证token未过期（默认30天）
- 前端会自动清除过期token并跳转登录页

### CORS错误
- 确保前端运行在 `ALLOWED_ORIGINS` 配置的来源
- 检查 `backend/.env` 中的 `ALLOWED_ORIGINS` 配置

### 数据库重置
```bash
# 删除数据库文件后重启后端即可重新创建
rm backend/data/couple_diary.db
```

## 📚 相关资源

- [Vue 3 文档](https://v3.vuejs.org/)
- [Express 文档](https://expressjs.com/)
- [sql.js 文档](https://sql.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📄 许可证

MIT License

---

**祝您使用愉快！记录你们的每一刻💕**
