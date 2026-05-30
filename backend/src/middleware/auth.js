import { verifyToken } from '../utils/auth.js';
import { isProduction } from '../config/env.js';

/**
 * JWT 认证中间件
 * 验证请求中的 JWT token 并将用户信息附加到 req.user
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      code: 'TOKEN_MISSING'
    });
  }

  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
  }
}

/**
 * 全局错误处理中间件
 * 统一处理所有未捕获的错误
 */
export function errorHandler(err, req, res, next) {
  // 记录错误（生产环境只记录错误消息，开发环境记录完整堆栈）
  if (isProduction()) {
    console.error(`[${new Date().toISOString()}] Error:`, err.message);
  } else {
    console.error(`[${new Date().toISOString()}] Error:`, err);
  }

  // CORS 错误
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS not allowed',
      code: 'CORS_ERROR'
    });
  }

  // Joi 验证错误
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.details.map(d => d.message),
      code: 'VALIDATION_ERROR'
    });
  }

  // 数据库错误
  if (err.code === 'SQLITE_CONSTRAINT') {
    return res.status(409).json({
      success: false,
      error: 'Data conflict',
      code: 'CONSTRAINT_ERROR'
    });
  }

  // 默认服务器错误
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: isProduction() ? 'Internal server error' : err.message,
    code: 'INTERNAL_ERROR',
    ...(isProduction() ? {} : { stack: err.stack })
  });
}

/**
 * 404 处理中间件
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'Resource not found',
    code: 'NOT_FOUND'
  });
}
