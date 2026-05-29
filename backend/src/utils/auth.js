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
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
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
