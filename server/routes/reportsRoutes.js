const express = require('express');
const router = express.Router();
const {
  getReportsSummary,
  exportTransactionsCSV
} = require('../controllers/reportsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getReportsSummary);
router.get('/export-csv', exportTransactionsCSV);

module.exports = router;
