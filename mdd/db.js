const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'mdd.db');

const db = new sqlite3.Database(dbPath);

// Initialize tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    category TEXT,
    date TEXT,
    image TEXT
  )`);
});

module.exports = db;
