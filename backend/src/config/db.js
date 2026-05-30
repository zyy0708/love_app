import initSqlJs from 'sql.js';
import dotenv from 'dotenv';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || './data/couple_diary.db';
const dbDir = dirname(dbPath);

if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

let db = null;
let SQL = null;

/**
 * 初始化数据库连接
 */
async function initDB() {
  SQL = await initSqlJs();

  if (existsSync(dbPath)) {
    try {
      const buffer = readFileSync(dbPath);
      db = new SQL.Database(buffer);
      console.log('✓ Loaded existing database');
    } catch (error) {
      console.warn('⚠️ Failed to load existing database, creating new one:', error);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
    console.log('✓ Created new database');
  }

  db.run("PRAGMA foreign_keys = ON");

  return db;
}

/**
 * 保存数据库到磁盘
 */
function saveDB() {
  if (db) {
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      writeFileSync(dbPath, buffer);
    } catch (error) {
      console.error('Failed to save database:', error);
    }
  }
}

/**
 * 执行 SQL 语句（INSERT, UPDATE, DELETE）
 * 使用原生参数化查询防止 SQL 注入
 * @param {string} sql - SQL 语句，使用 ? 作为参数占位符
 * @param {Array} params - 参数数组
 * @returns {Object} - 包含 lastInsertRowid 的结果对象
 */
function run(sql, params = []) {
  try {
    // 使用 sql.js 原生参数化查询
    db.run(sql, params);
    saveDB();
    const result = db.exec("SELECT last_insert_rowid() as id");
    const lastId = result[0]?.values[0]?.[0] || 0;
    return { lastInsertRowid: lastId };
  } catch (error) {
    console.error('SQL Error:', error.message);
    // 不打印完整 SQL 和参数，避免敏感信息泄露
    throw error;
  }
}

/**
 * 查询单行数据
 * 使用原生参数化查询防止 SQL 注入
 * @param {string} sql - SQL 语句，使用 ? 作为参数占位符
 * @param {Array} params - 参数数组
 * @returns {Object|null} - 查询结果行或 null
 */
function get(sql, params = []) {
  try {
    // 使用 sql.js 原生参数化查询
    const result = db.exec(sql, params);
    if (result.length === 0 || result[0].values.length === 0) return null;

    const columns = result[0].columns;
    const values = result[0].values[0];

    const row = {};
    columns.forEach((col, i) => {
      row[col] = values[i];
    });
    return row;
  } catch (error) {
    console.error('SQL Error:', error.message);
    throw error;
  }
}

/**
 * 查询多行数据
 * 使用原生参数化查询防止 SQL 注入
 * @param {string} sql - SQL 语句，使用 ? 作为参数占位符
 * @param {Array} params - 参数数组
 * @returns {Array} - 查询结果数组
 */
function all(sql, params = []) {
  try {
    // 使用 sql.js 原生参数化查询
    const result = db.exec(sql, params);
    if (result.length === 0) return [];

    const columns = result[0].columns;
    const rows = result[0].values;

    return rows.map(values => {
      const row = {};
      columns.forEach((col, i) => {
        row[col] = values[i];
      });
      return row;
    });
  } catch (error) {
    console.error('SQL Error:', error.message);
    throw error;
  }
}

/**
 * 执行原始 SQL（仅用于 DDL 和管理操作）
 * 警告：此函数不支持参数化查询，仅用于硬编码的 SQL 语句
 * @param {string} sql - SQL 语句
 */
function exec(sql) {
  try {
    db.exec(sql);
    saveDB();
  } catch (error) {
    console.error('SQL Error:', error.message);
    throw error;
  }
}

/**
 * 开始事务
 */
function beginTransaction() {
  db.run('BEGIN TRANSACTION');
}

/**
 * 提交事务
 */
function commit() {
  db.run('COMMIT');
  saveDB();
}

/**
 * 回滚事务
 */
function rollback() {
  db.run('ROLLBACK');
}

export { initDB, run, get, all, exec, saveDB, beginTransaction, commit, rollback };
export default { initDB, run, get, all, exec, saveDB, beginTransaction, commit, rollback };
