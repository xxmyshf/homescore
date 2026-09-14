const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3300;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- API Endpoints ---

// Get current state
app.get('/api/state', (req, res) => {
  try {
    const state = db.getFullState();
    res.json({ success: true, data: state });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Toggle Task
app.post('/api/tasks/:id/toggle', (req, res) => {
  try {
    const result = db.toggleTask(req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Adjust Member Score (+/-)
app.post('/api/members/:id/adjust-score', (req, res) => {
  try {
    const { delta, reason, type } = req.body;
    if (typeof delta !== 'number' || isNaN(delta)) {
      return res.status(400).json({ success: false, error: 'delta must be a valid number' });
    }
    const result = db.adjustMemberScore(req.params.id, delta, reason, type || 'manual');
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Complete Family Co-op Quest (All or selected members together gain points)
app.post('/api/coop/:id/complete', (req, res) => {
  try {
    const { participantIds } = req.body || {};
    const result = db.completeCoopActivity(req.params.id, participantIds);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Redeem Reward
app.post('/api/rewards/:id/redeem', (req, res) => {
  try {
    const { memberId } = req.body || {};
    const result = db.redeemReward(req.params.id, memberId);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Member CRUD (Character Config)
app.post('/api/members', (req, res) => {
  try {
    const member = db.addMember(req.body);
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.put('/api/members/:id', (req, res) => {
  try {
    const member = db.updateMember(req.params.id, req.body);
    res.json({ success: true, data: member });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete('/api/members/:id', (req, res) => {
  try {
    db.deleteMember(req.params.id);
    res.json({ success: true, message: 'Member deleted' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Task CRUD
app.post('/api/tasks', (req, res) => {
  try {
    const task = db.addTask(req.body);
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.put('/api/tasks/:id', (req, res) => {
  try {
    const task = db.updateTask(req.params.id, req.body);
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  try {
    db.deleteTask(req.params.id);
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Co-op CRUD
app.post('/api/coop', (req, res) => {
  try {
    const coop = db.addCoopActivity(req.body);
    res.json({ success: true, data: coop });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.put('/api/coop/:id', (req, res) => {
  try {
    const coop = db.updateCoopActivity(req.params.id, req.body);
    res.json({ success: true, data: coop });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete('/api/coop/:id', (req, res) => {
  try {
    db.deleteCoopActivity(req.params.id);
    res.json({ success: true, message: 'Coop activity deleted' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Reward CRUD
app.post('/api/rewards', (req, res) => {
  try {
    const reward = db.addReward(req.body);
    res.json({ success: true, data: reward });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete('/api/rewards/:id', (req, res) => {
  try {
    db.deleteReward(req.params.id);
    res.json({ success: true, message: 'Reward deleted' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Backup & Reset
app.get('/api/backup/export', (req, res) => {
  const data = db.exportBackup();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=homescore_backup_${Date.now()}.json`);
  res.send(JSON.stringify(data, null, 2));
});

app.post('/api/backup/import', (req, res) => {
  try {
    db.importBackup(req.body);
    res.json({ success: true, data: db.getFullState() });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/reset-defaults', (req, res) => {
  try {
    const state = db.resetToDefaults();
    res.json({ success: true, data: state });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HomeScore 21:9 Server running at http://localhost:${PORT}`);
  console.log(`🖥️  Ultra-Wide 21:9 Dashboard: http://localhost:${PORT}/`);
  console.log(`⚙️  Character Config Link:    http://localhost:${PORT}/config.html`);
});
