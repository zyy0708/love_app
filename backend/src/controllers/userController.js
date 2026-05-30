import * as userModel from '../models/user.js';
import { validatePasswordStrength, sanitizeInput, validateEmail } from '../utils/auth.js';

/**
 * 异步路由处理器包装器
 * 自动捕获异步错误并传递给错误处理中间件
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 用户注册
 */
export const register = asyncHandler(async (req, res) => {
  let { username, email, password } = req.body;

  // 清理输入
  username = sanitizeInput(username);
  email = sanitizeInput(email);

  // 验证必填字段
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields',
      details: ['username, email, and password are required']
    });
  }

  // 验证邮箱格式
  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }

  // 验证用户名长度
  if (username.length < 2 || username.length > 30) {
    return res.status(400).json({
      success: false,
      error: 'Username must be between 2 and 30 characters'
    });
  }

  // 验证密码强度
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      success: false,
      error: 'Password does not meet requirements',
      details: passwordValidation.errors
    });
  }

  try {
    const user = await userModel.registerUser(username, email, password);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        success: false,
        error: 'Username or email already exists'
      });
    }
    throw error;
  }
});

/**
 * 用户登录
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password required'
    });
  }

  const result = await userModel.loginUser(email, password);
  res.json(result);
});

/**
 * 获取用户资料
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await userModel.getUserById(req.user.userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    user
  });
});

/**
 * 初始化情侣关系
 * 创建绑定码供另一半绑定
 */
export const initializeCouple = asyncHandler(async (req, res) => {
  const user1Id = req.user.userId;
  const { user2Email } = req.body;

  if (!user2Email) {
    return res.status(400).json({
      success: false,
      error: 'user2Email required'
    });
  }

  const user2EmailSanitized = sanitizeInput(user2Email);
  if (!validateEmail(user2EmailSanitized)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }

  const user2 = await userModel.getUserByEmail(user2EmailSanitized);

  if (!user2) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // 防止自绑定
  if (user1Id === user2.id) {
    return res.status(400).json({
      success: false,
      error: '不能与自己配对'
    });
  }

  const user2Id = user2.id;

  // 检查是否已存在情侣关系
  const existingCouple = await userModel.getCoupleByEitherUserId(user1Id, user2Id);
  if (existingCouple) {
    return res.status(409).json({
      success: false,
      error: '已经存在配对关系'
    });
  }

  const couple = await userModel.createCouple(user1Id, user2Id);

  res.json({
    success: true,
    message: 'Couple created. Share this bind code with your partner.',
    bindCode: couple.bind_code,
    expiresAt: couple.bind_code_expires_at,
  });
});

/**
 * 绑定情侣关系
 * 使用绑定码完成配对
 */
export const bindCouple = asyncHandler(async (req, res) => {
  const { bindCode } = req.body;
  const userId = req.user.userId;

  if (!bindCode) {
    return res.status(400).json({
      success: false,
      error: 'Bind code required'
    });
  }

  const bindCodeSanitized = sanitizeInput(bindCode).toUpperCase();

  try {
    const couple = await userModel.bindCouple(bindCodeSanitized, userId);
    res.json({
      success: true,
      message: 'Couple bound successfully',
      couple
    });
  } catch (error) {
    if (error.message === 'Invalid or expired bind code') {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired bind code'
      });
    }
    if (error.message === 'User already in a couple') {
      return res.status(409).json({
        success: false,
        error: 'User already in a couple'
      });
    }
    throw error;
  }
});

/**
 * 获取当前用户的情侣信息
 */
export const getCouple = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const couple = await userModel.getCoupleByUserId(userId);

  if (!couple) {
    return res.status(404).json({
      success: false,
      error: 'No bound couple found'
    });
  }

  res.json({
    success: true,
    couple
  });
});
