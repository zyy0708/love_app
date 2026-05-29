import { run, get, all } from '../config/db.js';
import { hashPassword, comparePassword, generateToken, generateBindCode } from '../utils/auth.js';

export async function registerUser(username, email, password) {
  const hashedPassword = hashPassword(password);
  const result = run(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    [username, email, hashedPassword]
  );
  return { 
    id: result.lastInsertRowid, 
    username, 
    email, 
    created_at: new Date().toISOString() 
  };
}

export async function loginUser(email, password) {
  const user = get('SELECT id, email, password_hash, username FROM users WHERE email = ?', [email]);
  
  if (!user) {
    throw new Error('User not found');
  }

  const passwordMatch = comparePassword(password, user.password_hash);

  if (!passwordMatch) {
    throw new Error('Invalid password');
  }

  const token = generateToken(user.id);
  return { id: user.id, username: user.username, email: user.email, token };
}

export async function getUserById(userId) {
  return get('SELECT id, username, email, avatar_url, created_at FROM users WHERE id = ?', [userId]);
}

export async function getUserByEmail(email) {
  return get('SELECT id, username, email, avatar_url, created_at FROM users WHERE email = ?', [email]);
}

export async function createCouple(user1Id, user2Id) {
  const bindCode = generateBindCode();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const result = run(
    'INSERT INTO couples (user1_id, user2_id, bind_code, bind_code_expires_at) VALUES (?, ?, ?, ?)',
    [user1Id, user2Id, bindCode, expiresAt]
  );

  return get('SELECT * FROM couples WHERE id = ?', [result.lastInsertRowid]);
}

export async function bindCouple(bindCode, userId) {
  const couple = get(
    "SELECT * FROM couples WHERE bind_code = ? AND datetime(bind_code_expires_at) > datetime('now')",
    [bindCode]
  );

  if (!couple) {
    throw new Error('Invalid or expired bind code');
  }

  if (couple.user1_id !== userId && couple.user2_id !== userId) {
    throw new Error('You are not part of this couple');
  }

  run(
    "UPDATE couples SET is_bound = 1, bound_at = datetime('now'), bind_code_expires_at = NULL WHERE id = ?",
    [couple.id]
  );

  return get('SELECT * FROM couples WHERE id = ?', [couple.id]);
}

export async function getCoupleById(coupleId) {
  return get(`
    SELECT c.*, 
      u1.username as user1_username, u1.avatar_url as user1_avatar,
      u2.username as user2_username, u2.avatar_url as user2_avatar
     FROM couples c
     LEFT JOIN users u1 ON c.user1_id = u1.id
     LEFT JOIN users u2 ON c.user2_id = u2.id
     WHERE c.id = ?
  `, [coupleId]);
}

export async function getCoupleByUserId(userId) {
  return get(`
    SELECT c.*, 
      u1.username as user1_username, u1.avatar_url as user1_avatar,
      u2.username as user2_username, u2.avatar_url as user2_avatar
     FROM couples c
     LEFT JOIN users u1 ON c.user1_id = u1.id
     LEFT JOIN users u2 ON c.user2_id = u2.id
     WHERE (c.user1_id = ? OR c.user2_id = ?) AND c.is_bound = 1
  `, [userId, userId]);
}
