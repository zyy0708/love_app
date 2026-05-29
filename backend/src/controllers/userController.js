import * as userModel from '../models/user.js';
import { validatePasswordStrength, sanitizeInput, validateEmail } from '../utils/auth.js';

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export const register = asyncHandler(async (req, res) => {
  let { username, email, password } = req.body;

  username = sanitizeInput(username);
  email = sanitizeInput(email);

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (username.length < 2 || username.length > 30) {
    return res.status(400).json({ error: 'Username must be between 2 and 30 characters' });
  }

  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({ 
      error: 'Password does not meet requirements',
      details: passwordValidation.errors
    });
  }

  try {
    const user = await userModel.registerUser(username, email, password);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    console.error('Registration error:', error);
    throw error;
  }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = await userModel.loginUser(email, password);
  res.json(user);
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await userModel.getUserById(req.user.userId);
  res.json(user);
});

export const initializeCouple = asyncHandler(async (req, res) => {
  const user1Id = req.user.userId;
  const { user2Email } = req.body;

  if (!user2Email) {
    return res.status(400).json({ error: 'user2Email required' });
  }

  const user2EmailSanitized = sanitizeInput(user2Email);
  if (!validateEmail(user2EmailSanitized)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  const user2 = await userModel.getUserByEmail(user2EmailSanitized);
  
  if (!user2) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user2Id = user2.id;
  const couple = await userModel.createCouple(user1Id, user2Id);

  res.json({
    message: 'Couple created. Share this bind code with your partner.',
    bindCode: couple.bind_code,
    expiresAt: couple.bind_code_expires_at,
  });
});

export const bindCouple = asyncHandler(async (req, res) => {
  const { bindCode } = req.body;
  const userId = req.user.userId;

  if (!bindCode) {
    return res.status(400).json({ error: 'Bind code required' });
  }

  const bindCodeSanitized = sanitizeInput(bindCode).toUpperCase();
  const couple = await userModel.bindCouple(bindCodeSanitized, userId);
  res.json({ message: 'Couple bound successfully', couple });
});

export const getCouple = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const couple = await userModel.getCoupleByUserId(userId);

  if (!couple) {
    return res.status(404).json({ error: 'No bound couple found' });
  }

  res.json(couple);
});
