import * as diaryModel from '../models/diary.js';
import * as aiModel from '../models/ai.js';
import { requireCouple } from '../middleware/couple.js';
import { get } from '../config/db.js';

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export const createEntry = asyncHandler(async (req, res) => {
  await requireCouple(req, res, () => {});
  if (res.headersSent) return;

  const { title, content, mood, images } = req.body;
  const userId = req.user.userId;
  const coupleId = req.coupleId;

  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }

  const entry = await diaryModel.createDiaryEntry(coupleId, userId, title, content, mood, images || []);
  res.status(201).json(entry);
});

export const getEntries = asyncHandler(async (req, res) => {
  await requireCouple(req, res, () => {});
  if (res.headersSent) return;

  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const offset = parseInt(req.query.offset) || 0;
  const coupleId = req.coupleId;

  const entries = await diaryModel.getDiaryEntries(coupleId, limit, offset);
  res.json(entries);
});

export const getEntry = asyncHandler(async (req, res) => {
  await requireCouple(req, res, () => {});
  if (res.headersSent) return;

  const { entryId } = req.params;
  const coupleId = req.coupleId;

  const entry = await diaryModel.getDiaryEntryById(entryId, coupleId);

  if (!entry) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  res.json(entry);
});

export const updateEntry = asyncHandler(async (req, res) => {
  await requireCouple(req, res, () => {});
  if (res.headersSent) return;

  const { entryId } = req.params;
  const { title, content, mood, images } = req.body;
  const userId = req.user.userId;
  const coupleId = req.coupleId;

  const entryCheck = get(
    'SELECT author_id FROM diary_entries WHERE id = ? AND couple_id = ?',
    [entryId, coupleId]
  );

  if (!entryCheck) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  if (entryCheck.author_id !== userId) {
    return res.status(403).json({ error: 'Can only edit your own entries' });
  }

  const entry = await diaryModel.updateDiaryEntry(entryId, coupleId, title, content, mood, images || []);
  res.json(entry);
});

export const deleteEntry = asyncHandler(async (req, res) => {
  await requireCouple(req, res, () => {});
  if (res.headersSent) return;

  const { entryId } = req.params;
  const userId = req.user.userId;
  const coupleId = req.coupleId;

  const entryCheck = get(
    'SELECT author_id FROM diary_entries WHERE id = ? AND couple_id = ?',
    [entryId, coupleId]
  );

  if (!entryCheck) {
    return res.status(404).json({ error: 'Entry not found' });
  }

  if (entryCheck.author_id !== userId) {
    return res.status(403).json({ error: 'Can only delete your own entries' });
  }

  await diaryModel.deleteDiaryEntry(entryId, coupleId);
  res.json({ message: 'Entry deleted successfully' });
});

export const getTimeline = asyncHandler(async (req, res) => {
  await requireCouple(req, res, () => {});
  if (res.headersSent) return;

  const limit = Math.min(parseInt(req.query.limit) || 30, 100);
  const offset = parseInt(req.query.offset) || 0;
  const coupleId = req.coupleId;

  const feed = await diaryModel.getTimelineFeed(coupleId, limit, offset);
  res.json(feed);
});

export const getAISummary = asyncHandler(async (req, res) => {
  await requireCouple(req, res, () => {});
  if (res.headersSent) return;

  const { period = 'week' } = req.query;
  const coupleId = req.coupleId;

  let summary = await aiModel.getAISummary(coupleId, 'general', period);

  if (!summary) {
    let daysBack = 7;
    if (period === 'month') daysBack = 30;
    if (period === 'year') daysBack = 365;

    const entries = get(`
      SELECT * FROM diary_entries 
      WHERE couple_id = ? AND datetime(created_at) > datetime('now', '-${daysBack} days')
      ORDER BY created_at DESC
    `, [coupleId]);

    const content = await aiModel.generateAISummary(entries ? [entries] : []);
    const entryIds = entries ? [entries.id] : [];

    summary = await aiModel.cacheAISummary(coupleId, 'general', period, content, entryIds);
  }

  res.json(summary);
});
