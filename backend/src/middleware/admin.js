import { get } from '../config/db.js';

/**
 * 管理员权限检查中间件
 * 必须在 authenticateToken 中间件之后使用
 */
export function requireAdmin(req, res, next) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '未认证'
      });
    }

    // 查询用户是否为管理员
    const user = get('SELECT is_admin FROM users WHERE id = ?', [userId]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    if (!user.is_admin) {
      return res.status(403).json({
        success: false,
        message: '权限不足：需要管理员权限'
      });
    }

    // 用户是管理员，继续执行
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      success: false,
      message: '权限检查失败'
    });
  }
}
