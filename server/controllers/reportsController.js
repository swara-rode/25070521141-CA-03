const mongoose = require('mongoose');
const { Transaction } = require('../models/Transaction');
const { generateTransactionsCSV } = require('../utils/csvExporter');

// @desc    Get detailed financial analytics and reports for custom date ranges
// @route   GET /api/reports/summary
// @access  Private
const getReportsSummary = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    } else {
      // Default to current month
      const now = new Date();
      query.date = {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      };
    }

    // 1. Overall Income & Expense Totals
    const typeStats = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          avg: { $avg: '$amount' }
        }
      }
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    typeStats.forEach((stat) => {
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

    // 2. Category Breakdown for Expenses
    const expenseQuery = { ...query, type: 'expense' };
    const categoryBreakdown = await Transaction.aggregate([
      { $match: expenseQuery },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const formattedCategoryBreakdown = categoryBreakdown.map((item) => ({
      category: item._id,
      amount: Number(item.total.toFixed(2)),
      count: item.count,
      percentage: totalExpenses > 0 ? Number(((item.total / totalExpenses) * 100).toFixed(1)) : 0
    }));

    // 3. Payment Method Breakdown
    const paymentBreakdown = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const formattedPaymentBreakdown = paymentBreakdown.map((item) => ({
      method: item._id || 'Other',
      amount: Number(item.total.toFixed(2)),
      count: item.count
    }));

    // 4. Daily timeline for trend chart within the range
    const timeline = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            dateStr: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.dateStr': 1 } }
    ]);

    const timelineMap = {};
    timeline.forEach((item) => {
      const date = item._id.dateStr;
      if (!timelineMap[date]) {
        timelineMap[date] = { date, income: 0, expense: 0 };
      }
      if (item._id.type === 'income') timelineMap[date].income = Number(item.total.toFixed(2));
      if (item._id.type === 'expense') timelineMap[date].expense = Number(item.total.toFixed(2));
    });

    const timelineData = Object.values(timelineMap);

    res.status(200).json({
      success: true,
      totals: {
        income: Number(totalIncome.toFixed(2)),
        expenses: Number(totalExpenses.toFixed(2)),
        netSavings: Number(netSavings.toFixed(2)),
        savingsRate,
        transactionCount: incomeCount + expenseCount
      },
      categoryBreakdown: formattedCategoryBreakdown,
      paymentBreakdown: formattedPaymentBreakdown,
      timelineData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export authenticated user's transactions as CSV
// @route   GET /api/reports/export-csv
// @access  Private
const exportTransactionsCSV = async (req, res, next) => {
  try {
    const { startDate, endDate, type, category } = req.query;

    const query = { userId: req.user._id };

    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const transactions = await Transaction.find(query).sort({ date: -1 }).lean();

    const csvData = generateTransactionsCSV(transactions);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="ExpenseTracker_Export_${new Date().toISOString().split('T')[0]}.csv"`);
    res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReportsSummary,
  exportTransactionsCSV
};
