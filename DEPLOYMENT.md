# Couple Diary App - 部署指南

## 免费部署方案：Railway（后端）+ Vercel（前端）

---

## 第一步：推送代码到 GitHub

如果还没有推送，请在 PowerShell 运行：

```bash
cd e:\love_app
git init
git add .
git commit -m "Initial commit - Couple Diary App"
git remote add origin https://github.com/zyy0708/love_app.git
git branch -M main
git push -u origin main
```

---

## 第二步：部署后端到 Railway

### 1. 注册/登录 Railway
访问：https://railway.app

### 2. 点击 "New Project" → 选择 "Empty Project"

### 3. 添加服务
点击 "Add a Service" → 选择 "GitHub Repo" → 选择 `zyy0708/love_app`

### 4. 配置服务
- **Root Directory**: `backend`
- **Build Command**: `npm install && node src/db/migrate.js`
- **Start Command**: `npm start`

### 5. 设置环境变量（重要！）
在服务的 "Variables" 中添加：
```
JWT_SECRET=your_very_secure_secret_key_here_32chars_at_least
NODE_ENV=production
```

### 6. 等待部署完成
Railway 会自动部署，完成后您会得到一个网址，类似：
`https://couple-diary-api.up.railway.app`

---

## 第三步：部署前端到 Vercel

### 1. 修改前端 API 配置
在推送代码前，先更新 `frontend/src/services/api.js`：

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

创建 `frontend/.env.production`：
```
VITE_API_URL=https://your-railway-app.up.railway.app/api
```

### 2. 注册/登录 Vercel
访问：https://vercel.com

### 3. 点击 "Add New Project" → 选择 `zyy0708/love_app`

### 4. 配置项目
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`

### 5. 设置环境变量
在 "Environment Variables" 中添加：
```
VITE_API_URL=https://your-railway-app.up.railway.app/api
```

### 6. 点击 "Deploy"

---

## 完成！🎉

部署完成后：
- 前端地址：`https://love-app-xxxxx.vercel.app`
- 后端地址：`https://couple-diary-api.up.railway.app`

---

## 常见问题

### Q: 数据库会丢失数据吗？
A: Railway 免费版会自动持久化 SQLite 文件，不用担心。

### Q: 免费额度够用吗？
A: 个人使用完全够用。Railway 提供 $5/月免费额度，Vercel 免费。

### Q: 如何更新应用？
A: 只要推送到 GitHub 的 `main` 分支，Railway 和 Vercel 会自动重新部署！
