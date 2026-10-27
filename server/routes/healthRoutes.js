const express = require('express');
const router = express.Router();
const { getDBStatus } = require('../config/db');

// @desc    System health and database connectivity check
// @route   GET /api/health
// @access  Public
router.get('/', (req, res) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      connected: dbStatus.connected,
      status: dbStatus.connected ? 'connected' : 'disconnected'
    },
    version: '1.0.0'
  });
});

module.exports = router;
