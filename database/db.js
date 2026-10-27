const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");

const databasePath = path.join(__dirname, "lostfound.sqlite");
let db;
let SQL;

async function initializeDatabase() {
  SQL = await initSqlJs();
  const dir = path.dirname(databasePath);
  fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(databasePath)) {
    db = new SQL.Database(new Uint8Array(fs.readFileSync(databasePath)));
  } else {
    db = new SQL.Database();
  }
  db.run(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS item_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      item_type TEXT NOT NULL CHECK (item_type IN ('lost', 'found')),
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT NOT NULL,
      item_date TEXT NOT NULL,
      image_url TEXT,
      approximate_time TEXT,
      custody_status TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  const columns = db.exec("PRAGMA table_info(item_reports)")[0]?.values.map(row => row[1]) || [];
  for (const [name, definition] of [["image_url", "TEXT"], ["approximate_time", "TEXT"], ["custody_status", "TEXT"]]) {
    if (!columns.includes(name)) db.run(`ALTER TABLE item_reports ADD COLUMN ${name} ${definition}`);
  }
  saveDatabase();
  return db;
}

function getDatabase() {
  if (!db) throw new Error("Database has not been initialized");
  return db;
}

function saveDatabase() {
  if (!db) throw new Error("Database has not been initialized");
  const tempPath = `${databasePath}.tmp`;
  fs.writeFileSync(tempPath, Buffer.from(db.export()));
  fs.renameSync(tempPath, databasePath);
}

function queryAll(sql, params = []) {
  const statement = getDatabase().prepare(sql);
  try {
    statement.bind(params);
    const rows = [];
    while (statement.step()) rows.push(statement.getAsObject());
    return rows;
  } finally {
    statement.free();
  }
}

function queryOne(sql, params = []) {
  return queryAll(sql, params)[0] || null;
}

function run(sql, params = []) {
  const database = getDatabase();
  database.run(sql, params);
  const changes = database.getRowsModified();
  const lastId = queryOne("SELECT last_insert_rowid() AS id")?.id;
  saveDatabase();
  return { changes, lastId };
}

module.exports = { initializeDatabase, getDatabase, saveDatabase, queryAll, queryOne, run };
