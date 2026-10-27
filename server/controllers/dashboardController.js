const mongoose = require('mongoose');
const { Transaction } = require('../models/Transaction');
const Budget = require('../models/Budget');

// @desc    Get dashboard metrics & summary for selected month
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // 1. Current Month Aggregation (Income & Expenses)
    const monthlyStats = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    monthlyStats.forEach((stat) => {
      if (stat._id === 'income') {
        totalIncome = stat.total;
        incomeCount = stat.count;
      } else if (stat._id === 'expense') {
        totalExpenses = stat.total;
        expenseCount = stat.count;
      }
    });

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Number(((netSavings / totalIncome) * 100).toFixed(1)) : 0;

    // 2. Monthly Budget Aggregation
    const budgetStats = await Budget.aggregate([
      {
        $match: {
          userId: req.user._id,
          month,
          year
        }
      },
      {
        $group: {
          _id: null,
          totalBudget: { $sum: '$amount' }
        }
      }
    ]);

    const totalBudget = budgetStats.length > 0 ? budgetStats[0].totalBudget : 0;
    const budgetRemaining = totalBudget - totalExpenses;
    const budgetUsagePercent = totalBudget > 0 ? Number(((totalExpenses / totalBudget) * 100).toFixed(1)) : 0;

    // 3. Lifetime Totals
    const lifetimeStats = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    let lifetimeIncome = 0;
    let lifetimeExpenses = 0;

    lifetimeStats.forEach((stat) => {
      if (stat._id === 'income') lifetimeIncome = stat.total;
      if (stat._id === 'expense') lifetimeExpenses = stat.total;
    });

    const lifetimeBalance = lifetimeIncome - lifetimeExpenses;

    // 4. Recent Transactions (latest 5)
    const recentTransactions = await Transaction.find({ userId: req.user._id })
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .lean();

    res.status(200).json({
      success: true,
      month,
      year,
      monthly: {
        income: Number(totalIncome.toFixed(2)),
        expenses: Number(totalExpenses.toFixed(2)),
        netSavings: Number(netSavings.toFixed(2)),
        savingsRate,
        transactionCount: incomeCount + expenseCount,
        budget: Number(totalBudget.toFixed(2)),
        budgetRemaining: Number(budgetRemaining.toFixed(2)),
        budgetUsagePercent
      },
      lifetime: {
        income: Number(lifetimeIncome.toFixed(2)),
        expenses: Number(lifetimeExpenses.toFixed(2)),
        balance: Number(lifetimeBalance.toFixed(2))
      },
      recentTransactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get 6-month trends for Income vs Expense
// @route   GET /api/dashboard/trends
// @access  Private
const getDashboardTrends = async (req, res, next) => {
  try {
    const now = new Date();
    const monthsData = [];

    // Calculate dates for past 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const monthLabel = d.toLocaleString('en-US', { month: 'short' });

      monthsData.push({
        month: m,
        year: y,
        label: `${monthLabel} ${y}`,
        start: new Date(y, m - 1, 1),
        end: new Date(y, m, 0, 23, 59, 59, 999)
      });
    }

    const firstStart = monthsData[0].start;
    const lastEnd = monthsData[monthsData.length - 1].end;

    const aggregation = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: firstStart, $lte: lastEnd }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      }
    ]);

    const trends = monthsData.map((item) => {
      let income = 0;
      let expenses = 0;

      aggregation.forEach((agg) => {
        if (agg._id.year === item.year && agg._id.month === item.month) {
          if (agg._id.type === 'income') income = agg.total;
          if (agg._id.type === 'expense') expenses = agg.total;
        }
      });

      return {
        month: item.month,
        year: item.year,
        label: item.label,
        income: Number(income.toFixed(2)),
        expenses: Number(expenses.toFixed(2)),
        savings: Number((income - expenses).toFixed(2))
      };
    });

    res.status(200).json({
      success: true,
      trends
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category breakdown of expenses for selected month
// @route   GET /api/dashboard/category-breakdown
// @access  Private
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const categories = await Transaction.aggregate([
      {
        $match: {
          userId: req.user._id,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const totalExpense = categories.reduce((sum, item) => sum + item.total, 0);

    const breakdown = categories.map((cat) => ({
      category: cat._id,
      amount: Number(cat.total.toFixed(2)),
      count: cat.count,
      percentage: totalExpense > 0 ? Number(((cat.total / totalExpense) * 100).toFixed(1)) : 0
    }));

    res.status(200).json({
      success: true,
      month,
      year,
      totalExpense: Number(totalExpense.toFixed(2)),
      breakdown
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getDashboardTrends,
  getCategoryBreakdown
};
