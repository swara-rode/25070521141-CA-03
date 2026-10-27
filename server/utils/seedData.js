require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { Transaction } = require('../models/Transaction');
const Budget = require('../models/Budget');

const DEMO_USER_EMAIL = 'demo@expensetracker.local';

const seedDemoData = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error('CRITICAL: Seed script cannot be run in production environment.');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense_tracker';

  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Seed] Connected to database.');

    // Check if demo user already exists
    let demoUser = await User.findOne({ email: DEMO_USER_EMAIL });

    if (demoUser) {
      console.log(`[Seed] Demo account (${DEMO_USER_EMAIL}) already exists. Cleaning its past demo transactions...`);
      await Transaction.deleteMany({ userId: demoUser._id });
      await Budget.deleteMany({ userId: demoUser._id });
    } else {
      console.log(`[Seed] Creating demo user: ${DEMO_USER_EMAIL} ...`);
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash('DemoUser123!', salt);

      demoUser = await User.create({
        name: 'Demo Student',
        email: DEMO_USER_EMAIL,
        passwordHash,
        preferredCurrency: 'INR'
      });
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Create realistic sample transactions for current month
    const sampleTransactions = [
      // Incomes
      {
        userId: demoUser._id,
        type: 'income',
        title: 'Monthly College Allowance',
        amount: 15000,
        category: 'Allowance',
        date: new Date(currentYear, currentMonth - 1, 1),
        paymentMethod: 'Bank Transfer',
        notes: 'Monthly allowance from parents'
      },
      {
        userId: demoUser._id,
        type: 'income',
        title: 'Freelance Web Design Gig',
        amount: 8500,
        category: 'Freelance',
        date: new Date(currentYear, currentMonth - 1, 5),
        paymentMethod: 'UPI',
        notes: 'Website landing page redesign for local business'
      },
      {
        userId: demoUser._id,
        type: 'income',
        title: 'Academic Merit Scholarship',
        amount: 5000,
        category: 'Scholarship',
        date: new Date(currentYear, currentMonth - 1, 12),
        paymentMethod: 'Bank Transfer',
        notes: 'Semester scholarship installment'
      },
      // Expenses
      {
        userId: demoUser._id,
        type: 'expense',
        title: 'College Textbooks & Reference Notes',
        amount: 2200,
        category: 'Education',
        date: new Date(currentYear, currentMonth - 1, 2),
        paymentMethod: 'UPI',
        notes: 'Web development and algorithms reference books'
      },
      {
        userId: demoUser._id,
        type: 'expense',
        title: 'Campus Canteen & Groceries',
        amount: 3800,
        category: 'Food & Dining',
        date: new Date(currentYear, currentMonth - 1, 4),
        paymentMethod: 'UPI',
        notes: 'Weekly meals and snacks'
      },
      {
        userId: demoUser._id,
        type: 'expense',
        title: 'Metro & Bus Monthly Pass',
        amount: 1200,
        category: 'Transportation',
        date: new Date(currentYear, currentMonth - 1, 6),
        paymentMethod: 'Debit Card',
        notes: 'College commute card recharge'
      },
      {
        userId: demoUser._id,
        type: 'expense',
        title: 'High-Speed Broadband Internet',
        amount: 899,
        category: 'Bills & Utilities',
        date: new Date(currentYear, currentMonth - 1, 8),
        paymentMethod: 'UPI',
        notes: 'Monthly fiber internet plan'
      },
      {
        userId: demoUser._id,
        type: 'expense',
        title: 'New Coding Keyboard & Mousepad',
        amount: 1850,
        category: 'Shopping',
        date: new Date(currentYear, currentMonth - 1, 11),
        paymentMethod: 'Credit Card',
        notes: 'Ergonomic keyboard for development'
      },
      {
        userId: demoUser._id,
        type: 'expense',
        title: 'Weekend Movie & Dinner with Friends',
        amount: 950,
        category: 'Entertainment',
        date: new Date(currentYear, currentMonth - 1, 14),
        paymentMethod: 'UPI',
        notes: 'Weekend get-together'
      },
      {
        userId: demoUser._id,
        type: 'expense',
        title: 'Pharmacy & Health Vitamins',
        amount: 650,
        category: 'Health',
        date: new Date(currentYear, currentMonth - 1, 16),
        paymentMethod: 'Cash',
        notes: 'Prescriptions and multivitamin supplements'
      }
    ];

    await Transaction.insertMany(sampleTransactions);
    console.log(`[Seed] Successfully inserted ${sampleTransactions.length} sample transactions.`);

    // Create realistic budgets for current month
    const sampleBudgets = [
      {
        userId: demoUser._id,
        category: 'Food & Dining',
        amount: 5000,
        month: currentMonth,
        year: currentYear
      },
      {
        userId: demoUser._id,
        category: 'Transportation',
        amount: 2000,
        month: currentMonth,
        year: currentYear
      },
      {
        userId: demoUser._id,
        category: 'Education',
        amount: 3000,
        month: currentMonth,
        year: currentYear
      },
      {
        userId: demoUser._id,
        category: 'Shopping',
        amount: 2500,
        month: currentMonth,
        year: currentYear
      },
      {
        userId: demoUser._id,
        category: 'Entertainment',
        amount: 1500,
        month: currentMonth,
        year: currentYear
      },
      {
        userId: demoUser._id,
        category: 'Bills & Utilities',
        amount: 1200,
        month: currentMonth,
        year: currentYear
      }
    ];

    await Budget.insertMany(sampleBudgets);
    console.log(`[Seed] Successfully inserted ${sampleBudgets.length} category budgets.`);

    console.log('\n=============================================');
    console.log('✅ Demo Seed Data Generated Successfully!');
    console.log('Demo Credentials:');
    console.log(`  Email:    ${DEMO_USER_EMAIL}`);
    console.log('  Password: DemoUser123!');
    console.log('=============================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error running seed script:', error.message);
    process.exit(1);
  }
};

seedDemoData();
