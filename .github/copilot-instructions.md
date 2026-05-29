# GitHub Copilot 配置

这个项目配置了GitHub Copilot的自定义指令。

## 项目说明

- **项目名**: 情侣记录系统
- **技术栈**: Vue3 + Vite + Tailwind（前端）、Node.js + Express + PostgreSQL（后端）
- **主要功能**: 情侣日记、纪念日管理、AI总结

## 开发规范

### 代码风格
- 使用ES6+语法
- 前端：Vue3 组合式API
- 后端：异步/等待（async/await）
- 驼峰命名法

### 文件组织
```
前端: src/views/, src/components/, src/stores/, src/services/
后端: src/routes/, src/controllers/, src/models/, src/middleware/
```

### 常见命令
```bash
# 前端
npm run dev           # 启动开发服务器
npm run build         # 生成生产构建

# 后端
npm run dev           # 启动开发服务器
npm run migrate       # 运行数据库迁移
npm start             # 启动生产服务器
```

## 获得帮助

按下 Ctrl+I 调用 Copilot，询问：
- "为[功能]生成代码"
- "这个错误是什么意思"
- "如何优化这段代码"
- "添加[功能]的最佳实践是什么"

---

更多信息请查看：
- [README.md](../README.md) - 项目概述
- [ARCHITECTURE.md](ARCHITECTURE.md) - 系统设计
- [RUNNING_GUIDE.md](RUNNING_GUIDE.md) - 运行指南
