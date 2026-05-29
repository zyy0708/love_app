# 运行指南

## ✅ 前置条件检查

- [ ] Node.js >= 14 已安装
- [ ] npm 或 yarn 已安装
- [ ] PostgreSQL >= 12 已安装并运行
- [ ] Git （可选）

## 🔧 一键启动脚本

### Windows (PowerShell)

创建文件 `start.ps1`：
```powershell
Write-Host "🚀 情侣日记系统启动中..." -ForegroundColor Green
Write-Host ""

# 检查Node.js
$node = node --version
Write-Host "✓ Node.js: $node" -ForegroundColor Green

# 后端
Write-Host ""
Write-Host "📦 启动后端服务器..." -ForegroundColor Blue
cd backend
if (!(Test-Path "node_modules")) {
    Write-Host "安装后端依赖..." -ForegroundColor Yellow
    npm install
}
npm run dev &
$backendPid = $?

# 等待后端启动
Start-Sleep -Seconds 3

# 前端
Write-Host ""
Write-Host "📦 启动前端开发服务器..." -ForegroundColor Blue
cd ../frontend
if (!(Test-Path "node_modules")) {
    Write-Host "安装前端依赖..." -ForegroundColor Yellow
    npm install
}
npm run dev &
$frontendPid = $?

Write-Host ""
Write-Host "✅ 系统启动完成！" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 访问地址:" -ForegroundColor Green
Write-Host "   前端: http://localhost:5173" -ForegroundColor Yellow
Write-Host "   后端: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "按 Ctrl+C 停止服务器" -ForegroundColor Gray
```

运行：
```powershell
powershell -ExecutionPolicy Bypass -File start.ps1
```

### Linux/Mac

创建文件 `start.sh`：
```bash
#!/bin/bash

echo "🚀 情侣日记系统启动中..."
echo ""

# 检查Node.js
NODE_VERSION=$(node --version)
echo "✓ Node.js: $NODE_VERSION"

# 后端
echo ""
echo "📦 启动后端服务器..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "安装后端依赖..."
    npm install
fi
npm run dev &
BACKEND_PID=$!

# 等待后端启动
sleep 3

# 前端
echo ""
echo "📦 启动前端开发服务器..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 系统启动完成！"
echo ""
echo "🌐 访问地址:"
echo "   前端: http://localhost:5173"
echo "   后端: http://localhost:3000"
echo ""
echo "按 Ctrl+C 停止服务器"

wait
```

运行：
```bash
chmod +x start.sh
./start.sh
```

## 📋 分步运行

### 第1步：数据库准备

#### PostgreSQL 启动

**Windows:**
```cmd
# PostgreSQL已作为服务安装，通常自动启动
# 验证:
psql -U postgres -c "SELECT version();"
```

**Linux:**
```bash
sudo service postgresql start
# 或
sudo systemctl start postgresql
```

**Mac:**
```bash
brew services start postgresql
```

#### 创建数据库

```bash
# 连接到PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE couple_diary;

# 查看数据库
\l

# 连接到新数据库
\c couple_diary

# 退出
\q
```

### 第2步：后端启动

```bash
# 进入后端目录
cd backend

# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件（设置数据库密码等）
# Windows: notepad .env
# Linux/Mac: nano .env

# 安装依赖
npm install

# 运行数据库迁移（创建表）
npm run migrate

# 期望输出:
# ✓ Database migrations completed successfully

# 启动开发服务器
npm run dev

# 期望输出:
# ✓ Server running on http://localhost:3000
```

### 第3步：前端启动（新终端）

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 期望输出:
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

### 第4步：访问应用

打开浏览器访问：`http://localhost:5173`

## 🧪 测试流程

### 1. 测试注册和登录

1. 点击"开始使用"
2. 填写用户信息并注册
   - 用户名: 张三
   - 邮箱: zhangsan@example.com
   - 密码: password123
3. 自动跳转到登录页
4. 使用邮箱和密码登录
5. 登录成功后进入配对页面

### 2. 测试情侣配对

**账户1（张三）**:
1. 在配对页面输入伴侣邮箱: lisi@example.com
2. 点击"生成配对码"
3. 获得配对码（如: ABC123）

**账户2（李四）**（新浏览器或隐私模式）:
1. 注册新账户
   - 用户名: 李四
   - 邮箱: lisi@example.com
   - 密码: password123
2. 登录后进入配对页面
3. 输入配对码: ABC123
4. 点击"完成配对"

**验证配对**:
两个账户都应该看到对方的用户名和"已配对"状态。

### 3. 测试日记功能

1. 点击"写日记"
2. 填写日记内容
   - 标题: "我们的第一个故事"
   - 选择心情: 😊 (happy)
   - 内容: "今天很开心..."
3. 点击"保存日记"
4. 返回仪表板查看新日记
5. 点击日记查看详情
6. 测试编辑和删除功能

### 4. 测试AI总结

1. 在仪表板查看AI总结
2. 切换"周总结"/"月总结"/"年总结"
3. 查看生成的总结内容

### 5. 测试时间线

1. 点击"时间线"
2. 查看所有共同日记事件
3. 测试加载更多功能

## 🐛 常见问题排查

### 数据库连接失败

```
错误: connect ECONNREFUSED 127.0.0.1:5432
```

**解决**:
```bash
# 1. 检查PostgreSQL是否运行
# Windows: 任务管理器 → 搜索 postgresql

# 2. 验证连接参数
psql -h localhost -U postgres -c "SELECT 1"

# 3. 检查.env文件
cat backend/.env  # 确保DB_HOST, DB_USER, DB_PASSWORD正确

# 4. 重启PostgreSQL
sudo service postgresql restart
```

### 迁移失败

```
错误: column "xyz" already exists
```

**解决**:
```bash
# 数据库已存在表，可安全删除重建
cd backend

# 重置数据库
psql -U postgres -d couple_diary -f /dev/null

# 或通过psql重建
psql -U postgres
DROP DATABASE couple_diary;
CREATE DATABASE couple_diary;
\c couple_diary
\q

# 重新运行迁移
npm run migrate
```

### JWT认证失败

```
错误: Access token required
```

**解决**:
```bash
# 1. 检查localStorage中是否有token
# 打开浏览器DevTools → Application → localStorage

# 2. 检查JWT_SECRET是否一致
# backend/.env 中的 JWT_SECRET 必须一致

# 3. 清除缓存重新登录
# DevTools → Application → Clear site data
```

### 前端/后端连接失败

```
错误: Cannot POST /api/users/login
```

**解决**:
```bash
# 1. 确保后端运行在 localhost:3000
# 检查: curl http://localhost:3000/api/health

# 2. 检查CORS配置
# 后端 src/server.js 中的 cors()

# 3. 检查请求路径
# 应该是 /api/users/login（前端会自动添加baseURL）
```

### 文件上传失败

```
错误: ENOENT: no such file or directory, mkdir '/uploads'
```

**解决**:
```bash
# 确保uploads目录存在
mkdir -p backend/uploads

# 检查权限
chmod 755 backend/uploads
```

## 📊 监控运行状态

### 后端日志

```bash
# 日志会显示在终端
npm run dev

# 应该看到:
# ✓ Server running on http://localhost:3000
# Database migrations completed successfully
```

### 数据库验证

```bash
# 连接数据库检查表
psql -U postgres -d couple_diary

# 查看所有表
\dt

# 查看表结构
\d users
\d couples
\d diary_entries

# 查询数据
SELECT * FROM users;
```

### API测试

```bash
# 使用curl测试健康检查
curl http://localhost:3000/api/health

# 预期响应
# {"status":"API is running"}
```

## 🎯 本地开发工作流

### 编辑代码

后端更改会自动热重载（nodemon）：
```bash
# 修改 src/controllers/userController.js → 自动重启
```

前端更改会自动热更新（Vite HMR）：
```bash
# 修改 src/views/Dashboard.vue → 浏览器自动刷新
```

### 调试

#### 前端调试
```bash
# 1. 打开浏览器DevTools (F12)
# 2. 查看 Console 标签查看JavaScript错误
# 3. 查看 Network 标签查看API请求
# 4. 在 Sources 标签设置断点
```

#### 后端调试
```bash
# 在终端查看console.log输出
# 添加调试语句:
console.log('Debug:', variable);

# 或使用Node调试器
node --inspect src/server.js
# 在 chrome://inspect 中调试
```

## 🚀 生产部署预检

在部署前，运行以下检查：

```bash
# 1. 构建前端
cd frontend
npm run build
# 检查 dist/ 文件夹是否生成

# 2. 验证后端环境变量
cd ../backend
cat .env  # 不应该包含开发配置

# 3. 测试生产环境连接
npm start

# 4. 检查数据库备份
pg_dump -U postgres couple_diary > backup.sql
```

## 📞 技术支持

遇到问题？

1. **查看日志** - 检查终端输出和浏览器控制台
2. **检查README** - 阅读项目README.md
3. **检查文档** - 查看 docs/ARCHITECTURE.md
4. **搜索问题** - Google搜索错误消息
5. **创建Issue** - 在项目中提交问题

---

祝您开发愉快！💕
