import { get, all } from '../config/db.js';

export const getDbInfo = async (req, res) => {
  try {
    const users = all('SELECT * FROM users');
    const couples = all('SELECT * FROM couples');
    const entries = all('SELECT * FROM diary_entries');

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
