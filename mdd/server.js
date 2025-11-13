const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static site
app.use(express.static(path.join(__dirname)));

// Simple admin token for demo (in-memory)
const ADMIN_TOKEN = 'demo-admin-token';
const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'admin';

// Auth route (demo)
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return res.json({ token: ADMIN_TOKEN });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

function checkAdmin(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (token === ADMIN_TOKEN) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// Articles CRUD
app.get('/api/articles', (req, res) => {
  db.all('SELECT * FROM articles ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/articles/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.get('SELECT * FROM articles WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
});

app.post('/api/articles', checkAdmin, (req, res) => {
  const { title, content, category, date, image } = req.body;
  db.run(
    'INSERT INTO articles (title, content, category, date, image) VALUES (?, ?, ?, ?, ?)',
    [title, content, category, date, image],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT * FROM articles WHERE id = ?', [this.lastID], (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json(row);
      });
    }
  );
});

app.put('/api/articles/:id', checkAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { title, content, category, date, image } = req.body;
  db.run(
    'UPDATE articles SET title = ?, content = ?, category = ?, date = ?, image = ? WHERE id = ?',
    [title, content, category, date, image, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT * FROM articles WHERE id = ?', [id], (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json(row);
      });
    }
  );
});

app.delete('/api/articles/:id', checkAdmin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  db.run('DELETE FROM articles WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// Bulk import
app.post('/api/articles/bulk', checkAdmin, (req, res) => {
  const articles = req.body;
  if (!Array.isArray(articles)) return res.status(400).json({ error: 'Expected array' });

  db.serialize(() => {
    db.run('DELETE FROM articles');
    const stmt = db.prepare('INSERT INTO articles (title, content, category, date, image) VALUES (?, ?, ?, ?, ?)');
    articles.forEach(a => {
      stmt.run(a.title || '', a.content || '', a.category || '', a.date || '', a.image || '');
    });
    stmt.finalize(err => {
      if (err) return res.status(500).json({ error: err.message });
      db.all('SELECT * FROM articles ORDER BY id DESC', (err2, rows) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json(rows);
      });
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
