# 智能提交

请分析当前 git 改动，生成规范的 commit message 并提交。

## 步骤
1. 运行 `git status` 和 `git diff --staged` 查看改动
2. 如果没有暂存的改动，运行 `git diff` 查看未暂存改动，询问是否需要 `git add`
3. 分析改动内容，生成符合 Conventional Commits 规范的 commit message

## Commit Message 格式
```
<type>(<scope>): <description>

[optional body]
```

## Type 类型
- `feat`: 新功能
- `fix`: Bug 修复
- `refactor`: 重构
- `docs`: 文档
- `style`: 代码格式（不影响功能）
- `test`: 测试
- `chore`: 构建/工具/依赖

## 要求
- description 用中文，简洁明了
- scope 为改动涉及的模块
- 如果改动较多，在 body 中列出关键改动点
- 提交前展示 commit message 供确认
