const mongoose = require('mongoose');
const { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } = require('../models/Transaction');

// @desc    Get all transactions for authenticated user with search, filter, sort & pagination
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const {
      search,
      type,
      category,
      paymentMethod,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Scope query strictly to authenticated user
    const query = { userId: req.user._id };

    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { notes: searchRegex }];
    }

    // Sorting
    const sortField = ['date', 'amount', 'title'].includes(sortBy) ? sortBy : 'date';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sortObj = { [sortField]: sortDirection };

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [total, transactions] = await Promise.all([
      Transaction.countDocuments(query),
      Transaction.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean()
    ]);

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      });
    }

    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or access denied.'
      });
    }

    res.status(200).json({
      success: true,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const { type, title, amount, category, date, paymentMethod, notes } = req.body;

    // Field validations
    if (!type || !title || amount === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: type, title, amount, and category.'
      });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number greater than zero.'
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be either "income" or "expense".'
      });
    }

    const newTransaction = await Transaction.create({
      userId: req.user._id,
      type,
      title: title.trim(),
      amount: parsedAmount,
      category: category.trim(),
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'Cash',
      notes: notes ? notes.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: `${type === 'expense' ? 'Expense' : 'Income'} recorded successfully.`,
      transaction: newTransaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      });
    }

    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or access denied.'
      });
    }

    const { type, title, amount, category, date, paymentMethod, notes } = req.body;

    if (type !== undefined) {
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be either "income" or "expense".'
        });
      }
      transaction.type = type;
    }

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty.'
        });
      }
      transaction.title = title.trim();
    }

    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a positive number greater than zero.'
        });
      }
      transaction.amount = parsedAmount;
    }

    if (category !== undefined) {
      transaction.category = category.trim();
    }

    if (date !== undefined) {
      transaction.date = new Date(date);
    }

    if (paymentMethod !== undefined) {
      transaction.paymentMethod = paymentMethod;
    }

    if (notes !== undefined) {
      transaction.notes = notes.trim();
    }

    const updatedTransaction = await transaction.save();

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully.',
      transaction: updatedTransaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.'
      });
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or access denied.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get metadata: categories and payment methods
// @route   GET /api/transactions/meta
// @access  Private
const getTransactionMeta = async (req, res) => {
  res.status(200).json({
    success: true,
    expenseCategories: EXPENSE_CATEGORIES,
    incomeCategories: INCOME_CATEGORIES,
    paymentMethods: PAYMENT_METHODS
  });
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionMeta
};
