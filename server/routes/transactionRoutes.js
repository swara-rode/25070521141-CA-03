const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionMeta
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

// All transaction routes are protected
router.use(protect);

router.get('/meta', getTransactionMeta);

router.route('/')
  .get(getTransactions)
  .post(createTransaction);

router.route('/:id')
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
