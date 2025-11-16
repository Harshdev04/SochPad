const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// DB file in same folder
const DBSOURCE = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) return console.error(err.message);
  console.log('Connected to SQLite DB');
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    body TEXT,
    tags TEXT,
    updated_at INTEGER DEFAULT (strftime('%s','now'))
  )`);
});

const now = () => Math.floor(Date.now() / 1000);

// List notes with optional search q
app.get('/notes', (req, res) => {
  const q = req.query.q ? `%${req.query.q}%` : '%';
  db.all(
    `SELECT id, title, body, tags, updated_at FROM notes
     WHERE title LIKE ? OR body LIKE ?
     ORDER BY updated_at DESC`,
    [q, q],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get single note
app.get('/notes/:id', (req, res) => {
  db.get(`SELECT * FROM notes WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });
});

// Create note
app.post('/notes', (req, res) => {
  const { title = 'Untitled', body = '', tags = '' } = req.body;
  const tagsStr = Array.isArray(tags) ? tags.join(',') : tags;
  const ts = now();
  db.run(
    `INSERT INTO notes (title, body, tags, updated_at) VALUES (?, ?, ?, ?)`,
    [title, body, tagsStr, ts],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get(`SELECT * FROM notes WHERE id = ?`, [this.lastID], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
      });
    }
  );
});

// Update note
app.put('/notes/:id', (req, res) => {
  const { title = '', body = '', tags = '' } = req.body;
  const tagsStr = Array.isArray(tags) ? tags.join(',') : tags;
  const ts = now();
  db.run(
    `UPDATE notes SET title = ?, body = ?, tags = ?, updated_at = ? WHERE id = ?`,
    [title, body, tagsStr, ts, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get(`SELECT * FROM notes WHERE id = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
      });
    }
  );
});

// Delete note
app.delete('/notes/:id', (req, res) => {
  db.run(`DELETE FROM notes WHERE id = ?`, [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ deleted: true });
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));

