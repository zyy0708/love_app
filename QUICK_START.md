# 🚀 5分钟快速启动

## 前置检查

```bash
# 验证环境
node --version    # 需要 >= 14
npm --version
psql --version    # 需要 >= 12
```

## 一键启动

### Windows
```bash
cd 情侣app
# 修改以下脚本中的数据库密码

# PowerShell:
powershell -ExecutionPolicy Bypass -Command @"
cd backend; npm install; npm run migrate; npm run dev &
Start-Sleep 3
cd ../frontend; npm install; npm run dev
"@
```

### Linux / Mac
```bash
cd 情侣app

# 使用tmux或screen同时运行两个终端:

# 终端1 - 后端:
cd backend
npm install
npm run migrate
npm run dev

# 终端2 - 前端:
cd frontend
npm install
npm run dev
```

## 手动启动

### 步骤1：数据库初始化
```bash
psql -U postgres

CREATE DATABASE couple_diary;
\c couple_diary
\q
```

### 步骤2：后端启动
```bash
cd backend
cp .env.example .env
# 编辑 .env，设置数据库密码
npm install
npm run migrate
npm run dev
# 等待看到: ✓ Server running on http://localhost:3000
```

### 步骤3：前端启动（新终端）
```bash
cd frontend
npm install
npm run dev
# 等待看到: ➜  Local:   http://localhost:5173/
```

### 步骤4：打开浏览器
访问 **http://localhost:5173**

## 🎯 测试账户

### 账户1（张三）
- 邮箱: zhangsan@example.com
- 密码: password123

### 账户2（李四）
- 邮箱: lisi@example.com
- 密码: password123

## 完整配对步骤

1. **注册** - 用张三的信息
2. **生成配对码** - 输入 lisi@example.com
3. **复制配对码** - 例如 ABC123
4. **新建隐私窗口** - 注册李四的账户
5. **输入配对码** - 完成配对
6. **开始使用** - 写日记、查看时间线

## 📂 项目结构

```
情侣app/
├── backend/        后端 (Node.js + Express)
├── frontend/       前端 (Vue3 + Vite)
├── docs/
│   ├── ARCHITECTURE.md    系统架构
│   └── RUNNING_GUIDE.md   详细指南
├── README.md       完整文档
└── .github/
    └── copilot-instructions.md
```

## 🔧 故障排查

| 问题 | 解决 |
|------|------|
| 数据库连接失败 | 检查PostgreSQL是否运行：`psql -U postgres -c "SELECT 1"` |
| 迁移失败 | 删除数据库并重新创建：`DROP DATABASE couple_diary;` |
| 端口被占用 | 更改 `.env` 中的PORT或杀死占用进程 |
| 前端API错误 | 检查后端是否运行在 localhost:3000 |

## 📚 更多信息

- 完整文档：[README.md](README.md)
- 系统设计：[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- 运行指南：[docs/RUNNING_GUIDE.md](docs/RUNNING_GUIDE.md)

## 🎮 主要功能演示

### 功能清单
- ✅ 用户注册/登录
- ✅ 情侣配对（邀请码）
- ✅ 日记创建/编辑/删除
- ✅ 图片上传
- ✅ 心情记录
- ✅ AI自动总结（周/月/年）
- ✅ 时间线查看
- ✅ JWT认证

### API端点

| 功能 | 方法 | 端点 |
|------|------|------|
| 注册 | POST | `/api/users/register` |
| 登录 | POST | `/api/users/login` |
| 生成配对码 | POST | `/api/users/couple/initialize` |
| 绑定情侣 | POST | `/api/users/couple/bind` |
| 获取配对信息 | GET | `/api/users/couple` |
| 创建日记 | POST | `/api/diary` |
| 获取日记 | GET | `/api/diary` |
| 时间线 | GET | `/api/diary/timeline` |
| AI总结 | GET | `/api/diary/ai-summary` |

## 🌐 访问地址

- **前端**: http://localhost:5173
- **后端API**: http://localhost:3000
- **API健康检查**: http://localhost:3000/api/health

## 💡 下一步

完成启动后，可以：

1. **自定义功能**
   - 修改 `frontend/tailwind.config.js` 调整样式
   - 在 `backend/src/controllers/` 添加业务逻辑

2. **扩展功能**
   - 添加纪念日倒计时
   - 集成真实AI服务（OpenAI）
   - 添加社交分享功能

3. **部署应用**
   - 前端：Vercel / Netlify
   - 后端：Heroku / Railway / 自建服务器

## 📞 需要帮助？

1. 查看错误日志（终端输出）
2. 阅读详细指南：[docs/RUNNING_GUIDE.md](docs/RUNNING_GUIDE.md)
3. 检查API文档：[README.md](README.md#-api-文档)

---

**现在就开始构建你们的数字回忆吧！💕**

```
总用时：
- 安装依赖: ~1-2分钟
- 数据库迁移: ~30秒
- 启动服务: ~10秒

预计总时间：3-5分钟
```
