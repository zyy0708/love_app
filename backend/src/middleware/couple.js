import { get } from '../config/db.js';

export async function requireCouple(req, res, next) {
  try {
    const userId = req.user.userId;
    
    const result = get(
      'SELECT id FROM couples WHERE (user1_id = ? OR user2_id = ?) AND is_bound = 1',
      [userId, userId]
    );

    if (!result) {
      return res.status(403).json({ error: 'No bound couple found' });
    }

    req.coupleId = result.id;
    next();
  } catch (error) {
    next(error);
  }
}

export async function getCoupleIdByUserId(userId) {
  const result = get(
    'SELECT id FROM couples WHERE (user1_id = ? OR user2_id = ?) AND is_bound = 1',
    [userId, userId]
  );
  return result ? result.id : null;
}

export async function checkCoupleOwnership(coupleId, userId) {
  const result = get(
    'SELECT id FROM couples WHERE id = ? AND (user1_id = ? OR user2_id = ?) AND is_bound = 1',
    [coupleId, userId, userId]
  );
  return !!result;
}
