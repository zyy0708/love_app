import { initDB, exec } from '../config/db.js';

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  is_admin INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS couples (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user1_id INTEGER NOT NULL,
  user2_id INTEGER NOT NULL,
  bind_code TEXT UNIQUE,
  bind_code_expires_at DATETIME,
  is_bound INTEGER DEFAULT 0,
  bound_at DATETIME,
  anniversary DATE,
  anniversary_name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user1_id, user2_id)
);

CREATE TABLE IF NOT EXISTS diary_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  couple_id INTEGER NOT NULL,
  author_id INTEGER NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT,
  images TEXT DEFAULT '[]',
  ai_summary TEXT,
  is_public INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS timeline_feed (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  couple_id INTEGER NOT NULL,
  entry_id INTEGER,
  entry_type TEXT,
  title TEXT,
  preview TEXT,
  actor_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE,
  FOREIGN KEY (entry_id) REFERENCES diary_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ai_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  couple_id INTEGER NOT NULL,
  summary_type TEXT,
  period TEXT,
  content TEXT,
  entry_ids TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (couple_id) REFERENCES couples(id) ON DELETE CASCADE,
  UNIQUE(couple_id, summary_type, period)
);
`;

const indexes = `
CREATE INDEX IF NOT EXISTS idx_couples_user1 ON couples(user1_id);
CREATE INDEX IF NOT EXISTS idx_couples_user2 ON couples(user2_id);
CREATE INDEX IF NOT EXISTS idx_diary_couple ON diary_entries(couple_id);
CREATE INDEX IF NOT EXISTS idx_diary_author ON diary_entries(author_id);
CREATE INDEX IF NOT EXISTS idx_diary_created ON diary_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_timeline_couple ON timeline_feed(couple_id);
CREATE INDEX IF NOT EXISTS idx_timeline_created ON timeline_feed(created_at);
CREATE INDEX IF NOT EXISTS idx_timeline_entry_id ON timeline_feed(entry_id);
CREATE INDEX IF NOT EXISTS idx_diary_couple_created ON diary_entries(couple_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_couples_is_bound ON couples(is_bound);
`;

async function migrate() {
  try {
    console.log('Initializing database...');
    await initDB();
    
    console.log('Running database migrations...');
    exec(schema);
    exec(indexes);
    
    console.log('✓ Database migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration error:', error);
    process.exit(1);
  }
}

migrate();
