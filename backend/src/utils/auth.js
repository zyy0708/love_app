import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getEnv, isProduction } from '../config/env.js';

export function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(userId) {
  const secret = getEnv('JWT_SECRET', 'dev-secret-key-change-in-production-1234567890123456');
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  return jwt.sign({ userId }, secret, {
    expiresIn: '30d',
  });
}

export function verifyToken(token) {
  const secret = getEnv('JWT_SECRET', 'dev-secret-key-change-in-production-1234567890123456');
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  
  return jwt.verify(token, secret);
}

export function generateBindCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function validatePasswordStrength(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('密码至少需要8个字符');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('密码需要包含至少一个小写字母');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('密码需要包含至少一个大写字母');
  }
  
  if (!/\d/.test(password)) {
    errors.push('密码需要包含至少一个数字');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('密码需要包含至少一个特殊字符 (!@#$%^&*(),.?":{}|<>)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
