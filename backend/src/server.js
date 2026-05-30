import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/userRoutes.js';
import diaryRoutes from './routes/diaryRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/auth.js';
import { exec } from './config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const usePostgres = !!process.env.DATABASE_URL;

// Rate limiting
const rateLimit = (options = {}) => {
  const { windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests' } = options;
  const requests = new Map();

  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, times] of requests) {
      const valid = times.filter(time => time > now - windowMs);
      if (valid.length === 0) {
        requests.delete(key);
      } else {
        requests.set(key, valid);
      }
    }
  }, windowMs);
  cleanupInterval.unref();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requests.has(key)) requests.set(key, []);
    const requestTimes = requests.get(key).filter(time => time > windowStart);
    requests.set(key, requestTimes);

    if (requestTimes.length >= max) {
      return res.status(429).json({ error: message, retryAfter: Math.ceil(windowMs / 1000) });
    }
    requestTimes.push(now);
    next();
  };
};

const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many authentication attempts' });

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (origin.endsWith('.onrender.com')) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(generalLimiter);

// Rate limit auth endpoints
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

// API routes with CORS
app.use('/api', cors(corsOptions));
app.use('/api/users', userRoutes);
app.use('/api/diary', diaryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: usePostgres ? 'PostgreSQL' : 'SQLite',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Static files
app.use('/uploads', express.static('uploads'));
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.static(publicPath));

// API error handlers (before catch-all)
app.use('/api', notFoundHandler);
app.use('/api', errorHandler);

// SPA catch-all
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Database initialization and server start
async function startServer() {
  try {
    console.log(`Database: ${usePostgres ? 'PostgreSQL' : 'SQLite'}`);

    // Run migrations
    console.log('Running database migrations...');
    const schema = usePostgres ? getPgSchema() : getSqliteSchema();

    if (usePostgres) {
      const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
      for (const stmt of statements) {
        await exec(stmt + ';');
      }
    } else {
      exec(schema);
    }
    console.log('✓ Database migrations completed');

    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server running on http://0.0.0.0:${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      server.close(() => {
        console.log('✓ HTTP server closed');
        process.exit(0);
      });
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

function getPgSchema() {
  return `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      avatar_url TEXT,
      is_admin INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS couples (
      id SERIAL PRIMARY KEY,
      user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      bind_code VARCHAR(8) UNIQUE,
      bind_code_expires_at TIMESTAMP,
      is_bound INTEGER DEFAULT 0,
      bound_at TIMESTAMP,
      anniversary DATE,
      anniversary_name TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user1_id, user2_id)
    );

    CREATE TABLE IF NOT EXISTS diary_entries (
      id SERIAL PRIMARY KEY,
      couple_id INTEGER NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
      author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT,
      content TEXT NOT NULL,
      mood TEXT,
      images TEXT DEFAULT '[]',
      ai_summary TEXT,
      is_public INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS timeline_feed (
      id SERIAL PRIMARY KEY,
      couple_id INTEGER NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
      entry_id INTEGER REFERENCES diary_entries(id) ON DELETE CASCADE,
      entry_type TEXT,
      title TEXT,
      preview TEXT,
      actor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_summaries (
      id SERIAL PRIMARY KEY,
      couple_id INTEGER NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
      summary_type TEXT,
      period TEXT,
      content TEXT,
      entry_ids TEXT DEFAULT '[]',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(couple_id, summary_type, period)
    );

    CREATE INDEX IF NOT EXISTS idx_couples_user1 ON couples(user1_id);
    CREATE INDEX IF NOT EXISTS idx_couples_user2 ON couples(user2_id);
    CREATE INDEX IF NOT EXISTS idx_diary_couple ON diary_entries(couple_id);
    CREATE INDEX IF NOT EXISTS idx_diary_author ON diary_entries(author_id);
    CREATE INDEX IF NOT EXISTS idx_diary_created ON diary_entries(created_at);
    CREATE INDEX IF NOT EXISTS idx_timeline_couple ON timeline_feed(couple_id);
    CREATE INDEX IF NOT EXISTS idx_timeline_entry_id ON timeline_feed(entry_id);
  `;
}

function getSqliteSchema() {
  return `
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

    CREATE INDEX IF NOT EXISTS idx_couples_user1 ON couples(user1_id);
    CREATE INDEX IF NOT EXISTS idx_couples_user2 ON couples(user2_id);
    CREATE INDEX IF NOT EXISTS idx_diary_couple ON diary_entries(couple_id);
    CREATE INDEX IF NOT EXISTS idx_diary_author ON diary_entries(author_id);
    CREATE INDEX IF NOT EXISTS idx_diary_created ON diary_entries(created_at);
    CREATE INDEX IF NOT EXISTS idx_timeline_couple ON timeline_feed(couple_id);
    CREATE INDEX IF NOT EXISTS idx_timeline_entry_id ON timeline_feed(entry_id);
  `;
}

startServer();
