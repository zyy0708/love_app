import dotenv from 'dotenv';
dotenv.config();

const usePostgres = !!process.env.DATABASE_URL;
let db = null;
let initialized = false;

// 初始化数据库
export async function initDatabase() {
  if (initialized) return db;

  if (usePostgres) {
    console.log('Connecting to PostgreSQL...');
    try {
      const pg = await import('pg');
      const { Pool } = pg.default;

      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 10,
        connectionTimeoutMillis: 15000
      });

      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as now');
      console.log('✓ Connected to PostgreSQL at:', result.rows[0].now);
      client.release();

      function convertSql(sql) {
        let i = 0;
        return sql.replace(/\?/g, () => `$${++i}`);
      }

      db = {
        async run(sql, params = []) {
          const s = convertSql(sql);
          let r;
          if (sql.trim().toUpperCase().startsWith('INSERT')) {
            r = await pool.query(s + ' RETURNING id', params);
          } else {
            r = await pool.query(s, params);
          }
          return { lastInsertRowid: r.rows[0]?.id || 0, changes: r.rowCount };
        },
        async get(sql, params = []) {
          const r = await pool.query(convertSql(sql), params);
          return r.rows[0] || null;
        },
        async all(sql, params = []) {
          const r = await pool.query(convertSql(sql), params);
          return r.rows;
        },
        async exec(sql) { await pool.query(sql); },
        async beginTransaction() { await pool.query('BEGIN'); },
        async commit() { await pool.query('COMMIT'); },
        async rollback() { await pool.query('ROLLBACK'); },
        async close() { await pool.end(); }
      };
    } catch (err) {
      console.error('PostgreSQL connection failed:', err.message);
      console.error('Error code:', err.code);
      // 创建一个会报错的 db 对象，但不会崩溃
      db = {
        async run() { throw new Error('Database not connected: ' + err.message); },
        async get() { throw new Error('Database not connected: ' + err.message); },
        async all() { throw new Error('Database not connected: ' + err.message); },
        async exec() { throw new Error('Database not connected: ' + err.message); },
        async beginTransaction() { throw new Error('Database not connected'); },
        async commit() { throw new Error('Database not connected'); },
        async rollback() { throw new Error('Database not connected'); },
        async close() {}
      };
    }
  } else {
    console.log('Initializing SQLite...');
    const initSqlJs = (await import('sql.js')).default;
    const { existsSync, mkdirSync, readFileSync, writeFileSync } = await import('fs');
    const { dirname } = await import('path');
    const { fileURLToPath } = await import('url');

    const __dirname = dirname(fileURLToPath(import.meta.url));
    const dbPath = process.env.DB_PATH || './data/couple_diary.db';
    const dbDir = dirname(dbPath);
    if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });

    const SQL = await initSqlJs();
    let sqlite;
    if (existsSync(dbPath)) {
      try {
        sqlite = new SQL.Database(readFileSync(dbPath));
        console.log('✓ Loaded existing SQLite database');
      } catch {
        sqlite = new SQL.Database();
      }
    } else {
      sqlite = new SQL.Database();
      console.log('✓ Created new SQLite database');
    }
    sqlite.run("PRAGMA foreign_keys = ON");

    function saveDB() {
      try { writeFileSync(dbPath, Buffer.from(sqlite.export())); } catch {}
    }

    db = {
      run(sql, params = []) {
        sqlite.run(sql, params); saveDB();
        const r = sqlite.exec("SELECT last_insert_rowid() as id");
        return { lastInsertRowid: r[0]?.values[0]?.[0] || 0 };
      },
      get(sql, params = []) {
        const r = sqlite.exec(sql, params);
        if (!r.length || !r[0].values.length) return null;
        const row = {};
        r[0].columns.forEach((c, i) => { row[c] = r[0].values[0][i]; });
        return row;
      },
      all(sql, params = []) {
        const r = sqlite.exec(sql, params);
        if (!r.length) return [];
        return r[0].values.map(v => {
          const row = {};
          r[0].columns.forEach((c, i) => { row[c] = v[i]; });
          return row;
        });
      },
      exec(sql) { sqlite.exec(sql); saveDB(); },
      beginTransaction() { sqlite.run('BEGIN TRANSACTION'); },
      commit() { sqlite.run('COMMIT'); saveDB(); },
      rollback() { sqlite.run('ROLLBACK'); },
      close() { saveDB(); }
    };
  }

  initialized = true;
  return db;
}

// 导出数据库操作函数
export function run(sql, params) { return db.run(sql, params); }
export function get(sql, params) { return db.get(sql, params); }
export function all(sql, params) { return db.all(sql, params); }
export function exec(sql) { return db.exec(sql); }
export function beginTransaction() { return db.beginTransaction(); }
export function commit() { return db.commit(); }
export function rollback() { return db.rollback(); }
export function close() { return db.close(); }

export default { initDatabase, run, get, all, exec, beginTransaction, commit, rollback, close };
