// backend/server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');
const UPDATES_FILE = path.join(DATA_DIR, 'updates.json');

if (!fs.existsSync(REPORTS_FILE)) fs.writeFileSync(REPORTS_FILE, '[]', 'utf8');
if (!fs.existsSync(UPDATES_FILE)) {
  // Pre-populate with two example updates (like your screenshot)
  const initial = [
    { id: 1, role: 'politician', text: 'The new park will be constructed by next month.', createdAt: Date.now() },
    { id: 2, role: 'citizen', text: 'The street lights are not working properly in Block A.', createdAt: Date.now() }
  ];
  fs.writeFileSync(UPDATES_FILE, JSON.stringify(initial, null, 2), 'utf8');
}

// Helper read/write
function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8') || '[]');
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// Endpoint: read updates
app.get('/api/updates', (req, res) => {
  const updates = readJSON(UPDATES_FILE);
  // newest first
  updates.sort((a,b) => b.createdAt - a.createdAt);
  res.json(updates);
});

// Endpoint: post update (used when politician posts or citizen reports -> creates update)
app.post('/api/updates', (req, res) => {
  const { role, text, category } = req.body;
  if (!role || !text) return res.status(400).json({ error: 'role and text required' });
  const updates = readJSON(UPDATES_FILE);
  const newUpdate = { id: Date.now(), role, text, category: category || null, createdAt: Date.now() };
  updates.push(newUpdate);
  writeJSON(UPDATES_FILE, updates);
  res.json({ message: 'Update saved', update: newUpdate });
});

// Endpoint: submit report (separate collection)
app.get('/api/reports', (req, res) => {
  res.json(readJSON(REPORTS_FILE).sort((a,b)=>b.createdAt-a.createdAt));
});
app.post('/api/reports', (req, res) => {
  const { title, description, category, role='citizen' } = req.body;
  if (!title || !description) return res.status(400).json({ error: 'title and description required' });
  const reports = readJSON(REPORTS_FILE);
  const newReport = { id: Date.now(), title, description, category: category||null, role, createdAt: Date.now(), status: 'open' };
  reports.push(newReport);
  writeJSON(REPORTS_FILE, reports);

  // Also create an update so Updates feed shows it
  const updates = readJSON(UPDATES_FILE);
  updates.push({ id: Date.now()+1, role, text: `${title}: ${description}`, category, createdAt: Date.now() });
  writeJSON(UPDATES_FILE, updates);

  res.json({ message: 'Report submitted', report: newReport });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
