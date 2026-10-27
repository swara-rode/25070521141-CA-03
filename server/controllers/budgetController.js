const mongoose = require('mongoose');
const Budget = require('../models/Budget');
const { Transaction } = require('../models/Transaction');

// @desc    Get budgets with actual expense comparisons for a given month and year
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    // 1. Fetch all budgets for this user for month and year
    const budgets = await Budget.find({
      userId: req.user._id,
      month,
      year
    }).sort({ category: 1 }).lean();

    // 2. Fetch actual expenses for the month to calculate spending
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const expenseAggregation = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' }
        }
      }
    ]);

    // Create a spending map by category
    const spendingMap = {};
    expenseAggregation.forEach((item) => {
      spendingMap[item._id] = item.totalSpent;
    });

    // 3. Combine budgets with actual spending
    let totalAllocated = 0;
    let totalSpentInBudgetedCategories = 0;

    const budgetsWithSpending = budgets.map((budget) => {
      const spent = spendingMap[budget.category] || 0;
      const remaining = Number((budget.amount - spent).toFixed(2));
      const percentageUsed = budget.amount > 0 ? Number(((spent / budget.amount) * 100).toFixed(1)) : 0;
      
      let status = 'normal'; // < 80%
      if (percentageUsed >= 100) {
        status = 'exceeded';
      } else if (percentageUsed >= 80) {
        status = 'warning';
      }

      totalAllocated += budget.amount;
      totalSpentInBudgetedCategories += spent;

      return {
        ...budget,
        spent,
        remaining,
        percentageUsed,
        status
      };
    });

    res.status(200).json({
      success: true,
      month,
      year,
      totalAllocated: Number(totalAllocated.toFixed(2)),
      totalSpent: Number(totalSpentInBudgetedCategories.toFixed(2)),
      budgets: budgetsWithSpending
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res, next) => {
  try {
    const { category, amount, month, year } = req.body;

    if (!category || amount === undefined || !month || !year) {
      return res.status(400).json({
        success: false,
        message: 'All fields (category, amount, month, year) are required.'
      });
    }

    const parsedAmount = Number(amount);
    const parsedMonth = parseInt(month, 10);
    const parsedYear = parseInt(year, 10);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Budget amount must be a positive number.'
      });
    }

    if (parsedMonth < 1 || parsedMonth > 12) {
      return res.status(400).json({
        success: false,
        message: 'Month must be between 1 and 12.'
      });
    }

    // Check if budget already exists for this category/month/year
    const existing = await Budget.findOne({
      userId: req.user._id,
      category: category.trim(),
      month: parsedMonth,
      year: parsedYear
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A budget for "${category}" already exists for this month. You can edit the existing one.`
      });
    }

    const budget = await Budget.create({
      userId: req.user._id,
      category: category.trim(),
      amount: parsedAmount,
      month: parsedMonth,
      year: parsedYear
    });

    res.status(201).json({
      success: true,
      message: 'Budget allocated successfully.',
      budget
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found.'
      });
    }

    const budget = await Budget.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found or access denied.'
      });
    }

    const { amount, category, month, year } = req.body;

    if (amount !== undefined) {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Budget amount must be a positive number.'
        });
      }
      budget.amount = parsedAmount;
    }

    if (category !== undefined) {
      budget.category = category.trim();
    }

    if (month !== undefined) {
      const parsedMonth = parseInt(month, 10);
      if (parsedMonth < 1 || parsedMonth > 12) {
        return res.status(400).json({
          success: false,
          message: 'Month must be between 1 and 12.'
        });
      }
      budget.month = parsedMonth;
    }

    if (year !== undefined) {
      budget.year = parseInt(year, 10);
    }

    // Check duplicate if category, month or year changed
    const duplicate = await Budget.findOne({
      _id: { $ne: budget._id },
      userId: req.user._id,
      category: budget.category,
      month: budget.month,
      year: budget.year
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: `A budget for "${budget.category}" already exists for month ${budget.month}/${budget.year}.`
      });
    }

    const updated = await budget.save();

    res.status(200).json({
      success: true,
      message: 'Budget updated successfully.',
      budget: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found.'
      });
    }

    const budget = await Budget.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found or access denied.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Budget deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
};
