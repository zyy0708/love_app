import { get, all, exec } from '../config/db.js';

export const getDbInfo = async (req, res) => {
  try {
    const users = all('SELECT id, username, email, avatar_url, created_at FROM users');
    const couples = all('SELECT * FROM couples');
    const entries = all('SELECT id, couple_id, author_id, title, mood, created_at FROM diary_entries');

    res.json({
      users,
      couples,
      entries,
      counts: {
        users: users.length,
        couples: couples.length,
        entries: entries.length
      }
    });
  } catch (error) {
    console.error('Error fetching db info:', error);
    res.status(500).json({ error: 'Failed to fetch database info' });
  }
};

export const clearDatabase = async (req, res) => {
  try {
    exec('DELETE FROM diary_entries');
    exec('DELETE FROM couples');
    exec('DELETE FROM users');

    res.json({
      message: 'Database cleared successfully!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing database:', error);
    res.status(500).json({ error: 'Failed to clear database' });
  }
};
