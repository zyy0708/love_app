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

async function initDB() {
  SQL = await initSqlJs();
  
  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  db.run("PRAGMA foreign_keys = ON");
  
  return db;
}

function saveDB() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
}

function run(sql, params = []) {
  try {
    db.run(sql, params);
    saveDB();
    return { lastInsertRowid: db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] || 0 };
  } catch (error) {
    console.error('SQL Error:', error, 'SQL:', sql);
    throw error;
  }
}

function get(sql, params = []) {
  try {
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
    console.error('SQL Error:', error, 'SQL:', sql);
    throw error;
  }
}

function all(sql, params = []) {
  try {
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
    console.error('SQL Error:', error, 'SQL:', sql);
    throw error;
  }
}

function exec(sql) {
  try {
    db.exec(sql);
    saveDB();
  } catch (error) {
    console.error('SQL Error:', error, 'SQL:', sql);
    throw error;
  }
}

export { initDB, run, get, all, exec, saveDB };
export default { initDB, run, get, all, exec, saveDB };
