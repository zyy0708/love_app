import { run, get, all } from '../config/db.js';

export async function createDiaryEntry(coupleId, authorId, title, content, mood, images = []) {
  const imagesJson = JSON.stringify(images);
  
  const result = run(
    'INSERT INTO diary_entries (couple_id, author_id, title, content, mood, images) VALUES (?, ?, ?, ?, ?, ?)',
    [coupleId, authorId, title, content, mood, imagesJson]
  );
  const entryId = result.lastInsertRowid;

  const entry = get(`
    SELECT d.*, u.username, u.avatar_url
    FROM diary_entries d
    LEFT JOIN users u ON d.author_id = u.id
    WHERE d.id = ?
  `, [entryId]);

  const preview = content.substring(0, 100);
  run(
    'INSERT INTO timeline_feed (couple_id, entry_id, entry_type, title, preview, actor_id) VALUES (?, ?, ?, ?, ?, ?)',
    [coupleId, entryId, 'diary', title || '无标题', preview, authorId]
  );

  return entry;
}

export async function getDiaryEntries(coupleId, limit = 20, offset = 0) {
  return all(`
    SELECT d.*, u.username, u.avatar_url
    FROM diary_entries d
    LEFT JOIN users u ON d.author_id = u.id
    WHERE d.couple_id = ?
    ORDER BY d.created_at DESC
    LIMIT ? OFFSET ?
  `, [coupleId, limit, offset]);
}

export async function getDiaryEntryById(entryId, coupleId) {
  return get(`
    SELECT d.*, u.username, u.avatar_url
    FROM diary_entries d
    LEFT JOIN users u ON d.author_id = u.id
    WHERE d.id = ? AND d.couple_id = ?
  `, [entryId, coupleId]);
}

export async function updateDiaryEntry(entryId, coupleId, title, content, mood, images) {
  const imagesJson = JSON.stringify(images || []);
  
  run(`
    UPDATE diary_entries
    SET title = ?, content = ?, mood = ?, images = ?, updated_at = datetime('now')
    WHERE id = ? AND couple_id = ?
  `, [title, content, mood, imagesJson, entryId, coupleId]);

  return get(`
    SELECT d.*, u.username, u.avatar_url
    FROM diary_entries d
    LEFT JOIN users u ON d.author_id = u.id
    WHERE d.id = ?
  `, [entryId]);
}

export async function deleteDiaryEntry(entryId, coupleId) {
  run('DELETE FROM timeline_feed WHERE entry_id = ?', [entryId]);
  run('DELETE FROM diary_entries WHERE id = ? AND couple_id = ?', [entryId, coupleId]);
  return { id: entryId };
}

export async function getTimelineFeed(coupleId, limit = 30, offset = 0) {
  return all(`
    SELECT t.*, u.username, u.avatar_url
    FROM timeline_feed t
    LEFT JOIN users u ON t.actor_id = u.id
    WHERE t.couple_id = ?
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?
  `, [coupleId, limit, offset]);
}
