const express = require('express');
const router = express.Router();
const { get } = require('../database');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ success: false, message: 'Username and password required' });
  try {
    const admin = await get('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password]);
    if (admin) {
      res.json({ success: true, message: 'Login successful', user: { id: admin.id, username: admin.username } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
