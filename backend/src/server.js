import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/userRoutes.js';
import diaryRoutes from './routes/diaryRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/auth.js';
import { initDB, exec } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const requiredEnvVars = [];
const missingVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(key => console.error(`   - ${key}`));
  console.error('\nPlease set these variables in your .env file.');
  process.exit(1);
}

if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET must be at least 32 characters in production');
  process.exit(1);
}

console.log('✓ Environment configuration validated');

const app = express();
const PORT = process.env.PORT || 3000;

const rateLimit = (options = {}) => {
  const { windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests' } = options;
  
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!requests.has(key)) {
      requests.set(key, []);
    }
    
    const requestTimes = requests.get(key).filter(time => time > windowStart);
    requests.set(key, requestTimes);
    
    if (requestTimes.length >= max) {
      return res.status(429).json({ 
        error: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    requestTimes.push(now);
    next();
  };
};

const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many authentication attempts' });

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(generalLimiter);

app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

app.use('/uploads', express.static('uploads'));

const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

app.use('/api/users', userRoutes);
app.use('/api/diary', diaryRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.use(notFoundHandler);
app.use(errorHandler);

const schema = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
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
`;

async function startServer() {
  try {
    console.log('Initializing database...');
    await initDB();
    console.log('✓ Database initialized');
    
    console.log('Creating database tables...');
    exec(schema);
    exec(indexes);
    console.log('✓ Database tables created');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server running on http://0.0.0.0:${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
