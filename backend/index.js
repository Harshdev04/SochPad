// backend/index.js
const express = require('express');
const Database = require('better-sqlite3');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// DB file in same folder (will be created automatically)
const DBSOURCE = path.join(__dirname, 'db.sqlite');
const db = new Database(DBSOURCE);

// Ensure table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    body TEXT,
    tags TEXT,
    updated_at INTEGER DEFAULT (strftime('%s','now'))
  );
`);

// Helper: current unix timestamp
const now = () => Math.floor(Date.now() / 1000);

// GET /notes?q=search
app.get('/notes', (req, res) => {
  try {
    const q = req.query.q ? `%${req.query.q}%` : '%';
    const stmt = db.prepare(`
      SELECT id, title, body, tags, updated_at
      FROM notes
      WHERE title LIKE ? OR body LIKE ?
      ORDER BY updated_at DESC
    `);
    const rows = stmt.all(q, q);
    res.json(rows);
  } catch (err) {
    console.error('GET /notes error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /notes/:id
app.get('/notes/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM notes WHERE id = ?');
    const row = stmt.get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) {
    console.error('GET /notes/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /notes
app.post('/notes', (req, res) => {
  try {
    const { title = 'Untitled', body = '', tags = '' } = req.body;
    const tagsStr = Array.isArray(tags) ? tags.join(',') : tags;
    const ts = now();
    const stmt = db.prepare('INSERT INTO notes (title, body, tags, updated_at) VALUES (?, ?, ?, ?)');
    const info = stmt.run(title, body, tagsStr, ts);
    const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(info.lastInsertRowid);
    res.json(row);
  } catch (err) {
    console.error('POST /notes error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /notes/:id
app.put('/notes/:id', (req, res) => {
  try {
    const { title = '', body = '', tags = '' } = req.body;
    const tagsStr = Array.isArray(tags) ? tags.join(',') : tags;
    const ts = now();
    const stmt = db.prepare('UPDATE notes SET title = ?, body = ?, tags = ?, updated_at = ? WHERE id = ?');
    stmt.run(title, body, tagsStr, ts, req.params.id);
    const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
    res.json(row);
  } catch (err) {
    console.error('PUT /notes/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /notes/:id
app.delete('/notes/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ deleted: true });
  } catch (err) {
    console.error('DELETE /notes/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
