const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT
    )`);
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to my Express API with SQLite!' });
});

// Create Item (POST) with Validation
app.post('/items', (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Valid item name is required' });
    }
    const query = `INSERT INTO items (name, description) VALUES (?, ?)`;
    db.run(query, [name.trim(), description ? description.trim() : ''], function(err) {
      if (err) return next(err);
      res.status(201).json({ id: this.lastID, name: name.trim(), description: description ? description.trim() : '' });
    });
  } catch (err) {
    next(err);
  }
});

// Read All Items (GET)
app.get('/items', (req, res, next) => {
  db.all(`SELECT * FROM items`, [], (err, rows) => {
    if (err) return next(err);
    res.json({ items: rows });
  });
});

// Read Single Item by ID (GET)
app.get('/items/:id', (req, res, next) => {
  const { id } = req.params;
  db.get(`SELECT * FROM items WHERE id = ?`, [id], (err, row) => {
    if (err) return next(err);
    if (!row) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ item: row });
  });
});

// Update Item (PUT) with Validation
app.put('/items/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Valid item name is required' });
    }
    const query = `UPDATE items SET name = ?, description = ? WHERE id = ?`;
    db.run(query, [name.trim(), description ? description.trim() : '', id], function(err) {
      if (err) return next(err);
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json({ message: 'Item updated successfully', id, name: name.trim(), description: description ? description.trim() : '' });
    });
  } catch (err) {
    next(err);
  }
});

// Delete Item (DELETE)
app.delete('/items/:id', (req, res, next) => {
  const { id } = req.params;
  db.run(`DELETE FROM items WHERE id = ?`, [id], function(err) {
    if (err) return next(err);
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully', deletedId: id });
  });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
