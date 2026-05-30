import dotenv from 'dotenv';
dotenv.config();

// 根据环境选择数据库实现
const usePostgres = !!process.env.DATABASE_URL;

let db;

if (usePostgres) {
  // PostgreSQL 实现
  const pg = await import('pg');
  const { Pool } = pg.default;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? true : false
  });

  // 测试连接
  try {
    const client = await pool.connect();
    console.log('✓ Connected to PostgreSQL');
    client.release();
  } catch (err) {
    console.error('Failed to connect to PostgreSQL:', err.message);
    process.exit(1);
  }

  // 转换 SQL 的 ? 占位符为 PostgreSQL 的 $1, $2, ...
  function convertSql(sql) {
    let paramIndex = 0;
    return sql.replace(/\?/g, () => `$${++paramIndex}`);
  }

  db = {
    async run(sql, params = []) {
      const convertedSql = convertSql(sql);
      // 添加 RETURNING id 以获取插入的 ID
      let result;
      if (sql.trim().toUpperCase().startsWith('INSERT')) {
        const returningSql = convertedSql + ' RETURNING id';
        result = await pool.query(returningSql, params);
      } else {
        result = await pool.query(convertedSql, params);
      }
      return {
        lastInsertRowid: result.rows[0]?.id || 0,
        changes: result.rowCount
      };
    },

    async get(sql, params = []) {
      const convertedSql = convertSql(sql);
      const result = await pool.query(convertedSql, params);
      return result.rows[0] || null;
    },

    async all(sql, params = []) {
      const convertedSql = convertSql(sql);
      const result = await pool.query(convertedSql, params);
      return result.rows;
    },

    async exec(sql) {
      await pool.query(sql);
    },

    async beginTransaction() {
      await pool.query('BEGIN');
    },

    async commit() {
      await pool.query('COMMIT');
    },

    async rollback() {
      await pool.query('ROLLBACK');
    },

    async close() {
      await pool.end();
    }
  };

} else {
  // SQLite 实现 (sql.js - 本地开发)
  const initSqlJs = (await import('sql.js')).default;
  const { existsSync, mkdirSync, readFileSync, writeFileSync } = await import('fs');
  const { dirname } = await import('path');
  const { fileURLToPath } = await import('url');

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const dbPath = process.env.DB_PATH || './data/couple_diary.db';
  const dbDir = dirname(dbPath);

  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  let sqlite;
  const SQL = await initSqlJs();

  if (existsSync(dbPath)) {
    try {
      const buffer = readFileSync(dbPath);
      sqlite = new SQL.Database(buffer);
      console.log('✓ Loaded existing SQLite database');
    } catch (error) {
      console.warn('⚠️ Failed to load database, creating new one');
      sqlite = new SQL.Database();
    }
  } else {
    sqlite = new SQL.Database();
    console.log('✓ Created new SQLite database');
  }

  sqlite.run("PRAGMA foreign_keys = ON");

  function saveDB() {
    if (sqlite) {
      try {
        const data = sqlite.export();
        const buffer = Buffer.from(data);
        writeFileSync(dbPath, buffer);
      } catch (error) {
        console.error('Failed to save database:', error);
      }
    }
  }

  db = {
    run(sql, params = []) {
      sqlite.run(sql, params);
      saveDB();
      const result = sqlite.exec("SELECT last_insert_rowid() as id");
      const lastId = result[0]?.values[0]?.[0] || 0;
      return { lastInsertRowid: lastId };
    },

    get(sql, params = []) {
      const result = sqlite.exec(sql, params);
      if (result.length === 0 || result[0].values.length === 0) return null;
      const columns = result[0].columns;
      const values = result[0].values[0];
      const row = {};
      columns.forEach((col, i) => { row[col] = values[i]; });
      return row;
    },

    all(sql, params = []) {
      const result = sqlite.exec(sql, params);
      if (result.length === 0) return [];
      const columns = result[0].columns;
      return result[0].values.map(values => {
        const row = {};
        columns.forEach((col, i) => { row[col] = values[i]; });
        return row;
      });
    },

    exec(sql) {
      sqlite.exec(sql);
      saveDB();
    },

    beginTransaction() {
      sqlite.run('BEGIN TRANSACTION');
    },

    commit() {
      sqlite.run('COMMIT');
      saveDB();
    },

    rollback() {
      sqlite.run('ROLLBACK');
    },

    close() {
      saveDB();
    }
  };
}

// 导出统一接口
export function run(sql, params = []) {
  return db.run(sql, params);
}

export function get(sql, params = []) {
  return db.get(sql, params);
}

export function all(sql, params = []) {
  return db.all(sql, params);
}

export function exec(sql) {
  return db.exec(sql);
}

export function beginTransaction() {
  return db.beginTransaction();
}

export function commit() {
  return db.commit();
}

export function rollback() {
  return db.rollback();
}

export function close() {
  return db.close();
}

export default { run, get, all, exec, beginTransaction, commit, rollback, close };
