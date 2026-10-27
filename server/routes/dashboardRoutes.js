const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getDashboardTrends,
  getCategoryBreakdown
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/trends', getDashboardTrends);
router.get('/category-breakdown', getCategoryBreakdown);

module.exports = router;
