# 架构设计文档

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      浏览器 / 客户端                          │
└────────────────┬────────────────────────────────────────────┘
                 │ HTTP/HTTPS
                 ↓
┌─────────────────────────────────────────────────────────────┐
│                    Vite Dev Server                            │
│             (http://localhost:5173)                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Vue 3 + Tailwind CSS                        │   │
│  │  • Home / Login / Register                            │   │
│  │  • CoupleBinding / Dashboard                          │   │
│  │  • DiaryEditor / Timeline                             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Pinia 状态管理                           │   │
│  │  • AuthStore (用户登录状态)                          │   │
│  │  • DiaryStore (日记数据)                             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Services / API Layer                     │   │
│  │  • userService (auth/couple)                          │   │
│  │  • diaryService (entries/timeline/summary)            │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │ API Calls (JSON)
                 ↓
┌─────────────────────────────────────────────────────────────┐
│              Express.js API Server                            │
│           (http://localhost:3000)                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              路由层 (Routes)                         │   │
│  │  • /api/users (register, login, profile, couple)    │   │
│  │  • /api/diary (CRUD, timeline, ai-summary)          │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              控制器层 (Controllers)                   │   │
│  │  • userController (auth/couple logic)                │   │
│  │  • diaryController (diary operations)                │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              模型层 (Models)                         │   │
│  │  • User Model (auth operations)                      │   │
│  │  • Diary Model (entry operations)                    │   │
│  │  • AI Model (summary generation)                     │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              中间件 (Middleware)                      │   │
│  │  • JWT Authentication                                │   │
│  │  • Error Handling                                    │   │
│  │  • CORS                                              │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────────────┘
                 │ SQL Queries
                 ↓
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database                              │
│           (localhost:5432)                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Tables:                                              │   │
│  │  • users (accounts)                                  │   │
│  │  • couples (relationships)                           │   │
│  │  • diary_entries (content)                           │   │
│  │  • timeline_feed (aggregated)                        │   │
│  │  • ai_summaries (cached)                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 数据流

### 1. 用户注册流程
```
用户输入 → 前端Form → 验证 → API Call
  ↓
后端验证 → 密码哈希 → 数据库存储 → 返回用户信息
  ↓
前端存储Token → 跳转登录
```

### 2. 情侣配对流程
```
用户A生成配对码 → API返回码 → 分享码给用户B
  ↓
用户B输入码 → API验证码 → 关联couples表
  ↓
两用户都获得couple_id → 可开始共享日记
```

### 3. 创建日记流程
```
用户编辑 → 上传图片(Base64) → API验证权限
  ↓
保存到diary_entries表 → 自动添加到timeline_feed
  ↓
返回entryId → 前端刷新列表
```

### 4. AI总结流程
```
用户请求周/月/年总结
  ↓
检查缓存 (ai_summaries表)
  ↓
缓存命中 → 直接返回
缓存未命中 → 查询diary_entries → 调用AI服务 → 缓存结果
  ↓
返回摘要给前端
```

## 数据库模式

### users表
```
id (PK)
├─ username (UNIQUE)
├─ email (UNIQUE)
├─ password_hash
├─ avatar_url
├─ created_at
└─ updated_at
```

### couples表
```
id (PK)
├─ user1_id (FK users)
├─ user2_id (FK users)
├─ bind_code (UNIQUE, 24h有效)
├─ is_bound (boolean)
├─ bound_at
├─ anniversary (date)
├─ anniversary_name
├─ created_at
└─ updated_at
```

### diary_entries表
```
id (PK)
├─ couple_id (FK couples)
├─ author_id (FK users)
├─ title
├─ content
├─ mood (enum)
├─ images (text array)
├─ ai_summary
├─ is_public
├─ created_at
└─ updated_at
```

### timeline_feed表
```
id (PK)
├─ couple_id (FK couples)
├─ entry_id (FK diary_entries)
├─ entry_type
├─ title
├─ preview
├─ actor_id (FK users)
└─ created_at
```

### ai_summaries表
```
id (PK)
├─ couple_id (FK couples)
├─ summary_type
├─ period (week/month/year)
├─ content
├─ entry_ids (integer array)
└─ created_at
```

## 认证流程

```
1. 用户登录 → 验证email/password
  ↓
2. 验证成功 → 生成JWT Token (30天过期)
  ↓
3. 前端存储token到localStorage
  ↓
4. 后续请求 → Authorization Header: Bearer {token}
  ↓
5. 服务器验证token → 提取userId
  ↓
6. Token过期 → 返回403 → 前端清除token并重定向登录
```

## 安全考虑

1. **密码安全**
   - bcryptjs加密，salt轮数10
   - 不存储明文密码

2. **令牌安全**
   - JWT签名，防篡改
   - 30天过期
   - 存储在localStorage

3. **数据隐私**
   - 只能访问自己couple的数据
   - 日记只有couple成员可见
   - 权限验证在每个API端点

4. **SQL注入防护**
   - 使用参数化查询
   - pg库自动转义

5. **CORS配置**
   - 允许localhost:5173
   - 验证Origin header

## 扩展点

### 1. 图片存储
当前：Base64存储到数据库
可优化：
- 上传到云存储（OSS/S3）
- 存储URL到数据库
- CDN加速

### 2. AI集成
当前：Mock AI生成
可改进：
- 集成OpenAI GPT-3/4
- 使用百度AI、阿里云等
- 缓存优化

### 3. 实时通知
可添加：
- WebSocket连接
- 消息推送
- 伴侣在线状态

### 4. 社交功能
可扩展：
- 朋友圈分享
- 评论互动
- 点赞系统

### 5. 高级搜索
可实现：
- 全文搜索
- 按心情/日期筛选
- 高级查询DSL

## 性能优化

1. **数据库**
   - 索引关键字段
   - 分页查询
   - 连接池配置

2. **缓存**
   - AI总结缓存
   - Redis集成（可选）
   - 浏览器缓存

3. **API**
   - 响应压缩
   - 字段选择
   - 批量操作

4. **前端**
   - 代码分割
   - 懒加载
   - 虚拟列表

## 部署架构

```
生产环境：
├─ Nginx (反向代理)
├─ Node.js (多进程/PM2)
├─ PostgreSQL (主从复制)
├─ Redis (缓存)
└─ CDN (静态资源)
```

## 开发工作流

```
开发环境：
├─ npm run dev (同时启动前后端)
├─ 热重载
└─ 本地调试

测试环境：
├─ npm test
├─ API测试
└─ UI测试

生产构建：
├─ npm run build
├─ 前端: npm run build → dist/
└─ 后端: 直接运行
```

---

完整的架构设计支持：
✅ 实时性：WebSocket (可扩展)
✅ 可靠性：事务管理
✅ 可扩展性：模块化设计
✅ 可维护性：清晰的代码结构
