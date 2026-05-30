import { get, all, run, beginTransaction, commit, rollback } from '../config/db.js';

/**
 * 获取数据库信息（仅管理员）
 * 返回用户、情侣和日记的统计信息
 */
export const getDbInfo = async (req, res) => {
  try {
    const users = all('SELECT id, username, email, avatar_url, is_admin, created_at FROM users');
    const couples = all('SELECT id, user1_id, user2_id, is_bound, bound_at, anniversary, created_at FROM couples');
    const entries = all('SELECT id, couple_id, author_id, title, mood, created_at FROM diary_entries');
    const summaries = all('SELECT id, couple_id, summary_type, period, created_at FROM ai_summaries');

    res.json({
      success: true,
      data: {
        users,
        couples,
        entries,
        summaries,
        counts: {
          users: users.length,
          couples: couples.length,
          entries: entries.length,
          summaries: summaries.length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching db info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch database info'
    });
  }
};

/**
 * 清空数据库（仅管理员）
 * 使用事务确保数据一致性
 */
export const clearDatabase = async (req, res) => {
  try {
    beginTransaction();

    // 按照外键依赖顺序删除
    run('DELETE FROM ai_summaries');
    run('DELETE FROM timeline_feed');
    run('DELETE FROM diary_entries');
    run('DELETE FROM couples');
    run('DELETE FROM users');

    commit();

    res.json({
      success: true,
      message: 'Database cleared successfully!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    rollback();
    console.error('Error clearing database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear database'
    });
  }
};
