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

function escapeValue(value) {
  if (value === null || value === undefined) {
    return 'NULL';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  const escaped = value.replace(/'/g, "''");
  return `'${escaped}'`;
}

function bindParams(sql, params) {
  let result = sql;
  let paramIndex = 0;
  
  if (!params || params.length === 0) {
    return result;
  }
  
  result = result.replace(/\?/g, () => {
    if (paramIndex < params.length) {
      return escapeValue(params[paramIndex++]);
    }
    return '?';
  });
  
  return result;
}

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

function run(sql, params = []) {
  try {
    const boundSql = bindParams(sql, params);
    db.run(boundSql);
    saveDB();
    const result = db.exec("SELECT last_insert_rowid() as id");
    const lastId = result[0]?.values[0]?.[0] || 0;
    return { lastInsertRowid: lastId };
  } catch (error) {
    console.error('SQL Error:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

function get(sql, params = []) {
  try {
    const boundSql = bindParams(sql, params);
    const result = db.exec(boundSql);
    if (result.length === 0 || result[0].values.length === 0) return null;
    
    const columns = result[0].columns;
    const values = result[0].values[0];
    
    const row = {};
    columns.forEach((col, i) => {
      row[col] = values[i];
    });
    return row;
  } catch (error) {
    console.error('SQL Error:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

function all(sql, params = []) {
  try {
    const boundSql = bindParams(sql, params);
    const result = db.exec(boundSql);
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
    console.error('SQL Error:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

function exec(sql) {
  try {
    db.exec(sql);
    saveDB();
  } catch (error) {
    console.error('SQL Error:', error);
    console.error('SQL:', sql);
    throw error;
  }
}

export { initDB, run, get, all, exec, saveDB };
export default { initDB, run, get, all, exec, saveDB };
