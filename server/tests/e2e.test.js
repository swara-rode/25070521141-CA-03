process.env.NODE_ENV = 'test';
require('dotenv').config({ path: __dirname + '/../.env' });
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const { Transaction } = require('../models/Transaction');
const Budget = require('../models/Budget');

const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense_tracker';

describe('Comprehensive End-to-End API Integration Tests', () => {
  let user1Token = '';
  let user1Id = '';
  let user2Token = '';
  let user2Id = '';
  let createdTxId = '';
  let createdBudgetId = '';

  before(async () => {
    // Connect to live MongoDB if not connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(TEST_DB_URI);
    }
    // Clean test accounts if present
    await User.deleteMany({ email: { $in: ['e2e_user1@test.com', 'e2e_user2@test.com'] } });
  });

  after(async () => {
    // Clean up created test data
    if (user1Id) {
      await Transaction.deleteMany({ userId: user1Id });
      await Budget.deleteMany({ userId: user1Id });
      await User.findByIdAndDelete(user1Id);
    }
    if (user2Id) {
      await Transaction.deleteMany({ userId: user2Id });
      await Budget.deleteMany({ userId: user2Id });
      await User.findByIdAndDelete(user2Id);
    }
    await mongoose.connection.close();
  });

  it('1. Should register a new user and return JWT token without returning passwordHash', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Swara Rode',
        email: 'e2e_user1@test.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
    assert.equal(res.body.user.email, 'e2e_user1@test.com');
    assert.equal(res.body.user.passwordHash, undefined);

    user1Token = res.body.token;
    user1Id = res.body.user.id;

    // Verify in database directly that password was hashed
    const dbUser = await User.findById(user1Id);
    assert.ok(dbUser.passwordHash);
    assert.notEqual(dbUser.passwordHash, 'Password123!');
  });

  it('2. Should reject duplicate email registration with 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Swara Rode Duplicate',
        email: 'e2e_user1@test.com',
        password: 'Password123!',
        confirmPassword: 'Password123!'
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('already exists'));
  });

  it('3. Should login registered user successfully with correct password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'e2e_user1@test.com',
        password: 'Password123!'
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.token);
  });

  it('4. Should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'e2e_user1@test.com',
        password: 'WrongPassword999'
      });

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('5. Should get current authenticated user profile via GET /api/auth/me', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.user.email, 'e2e_user1@test.com');
  });

  it('6. Should register second user for ownership isolation testing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Second Student',
        email: 'e2e_user2@test.com',
        password: 'Password456!',
        confirmPassword: 'Password456!'
      });

    assert.equal(res.status, 201);
    user2Token = res.body.token;
    user2Id = res.body.user.id;
  });

  it('7. User 1 creates an income transaction (amount 10,000)', async () => {
    const now = new Date();
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        type: 'income',
        title: 'Monthly College Stipend',
        amount: 10000,
        category: 'Scholarship',
        date: now.toISOString(),
        paymentMethod: 'Bank Transfer',
        notes: 'Semester scholarship'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.transaction.amount, 10000);
  });

  it('8. User 1 creates an expense transaction (amount 3,000)', async () => {
    const now = new Date();
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        type: 'expense',
        title: 'Textbooks and Notebooks',
        amount: 3000,
        category: 'Education',
        date: now.toISOString(),
        paymentMethod: 'UPI',
        notes: 'Programming reference books'
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.transaction.amount, 3000);
    createdTxId = res.body.transaction._id;
  });

  it('9. User 1 updates transaction', async () => {
    const res = await request(app)
      .put(`/api/transactions/${createdTxId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: 'Textbooks and Reference Manuals',
        amount: 3200
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.transaction.title, 'Textbooks and Reference Manuals');
    assert.equal(res.body.transaction.amount, 3200);
  });

  it('10. User 2 CANNOT access User 1 transaction by ID (Per-User Ownership check)', async () => {
    const res = await request(app)
      .get(`/api/transactions/${createdTxId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });

  it('11. User 2 CANNOT delete User 1 transaction by ID', async () => {
    const res = await request(app)
      .delete(`/api/transactions/${createdTxId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });

  it('12. User 1 creates a Category Budget for Education', async () => {
    const now = new Date();
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        category: 'Education',
        amount: 5000,
        month: now.getMonth() + 1,
        year: now.getFullYear()
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.budget.amount, 5000);
    createdBudgetId = res.body.budget._id;
  });

  it('13. System prevents duplicate budget for same category/month/year', async () => {
    const now = new Date();
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        category: 'Education',
        amount: 6000,
        month: now.getMonth() + 1,
        year: now.getFullYear()
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('already exists'));
  });

  it('14. Budget GET computes actual spending and remaining amount from expense records', async () => {
    const now = new Date();
    const res = await request(app)
      .get(`/api/budgets?month=${now.getMonth() + 1}&year=${now.getFullYear()}`)
      .set('Authorization', `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.totalAllocated, 5000);
    // User 1 spent 3200 on Education
    assert.equal(res.body.totalSpent, 3200);
    const eduBudget = res.body.budgets.find((b) => b.category === 'Education');
    assert.ok(eduBudget);
    assert.equal(eduBudget.spent, 3200);
    assert.equal(eduBudget.remaining, 1800);
    assert.equal(eduBudget.status, 'normal'); // 3200/5000 = 64% (< 80%)
  });

  it('15. Dashboard summary calculates exact numbers from real database records', async () => {
    const now = new Date();
    const res = await request(app)
      .get(`/api/dashboard/summary?month=${now.getMonth() + 1}&year=${now.getFullYear()}`)
      .set('Authorization', `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    // 10,000 income, 3,200 expenses => net 6,800
    assert.equal(res.body.monthly.income, 10000);
    assert.equal(res.body.monthly.expenses, 3200);
    assert.equal(res.body.monthly.netSavings, 6800);
    assert.equal(res.body.monthly.budget, 5000);
    assert.equal(res.body.recentTransactions.length, 2);
  });

  it('16. User 2 dashboard is completely isolated (empty state with 0 amounts)', async () => {
    const now = new Date();
    const res = await request(app)
      .get(`/api/dashboard/summary?month=${now.getMonth() + 1}&year=${now.getFullYear()}`)
      .set('Authorization', `Bearer ${user2Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.monthly.income, 0);
    assert.equal(res.body.monthly.expenses, 0);
    assert.equal(res.body.monthly.netSavings, 0);
    assert.equal(res.body.recentTransactions.length, 0);
  });

  it('17. Reports CSV export returns valid text/csv attachment with user data', async () => {
    const res = await request(app)
      .get('/api/reports/export-csv')
      .set('Authorization', `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.ok(res.headers['content-type'].includes('text/csv'));
    assert.ok(res.text.includes('Monthly College Stipend'));
    assert.ok(res.text.includes('Textbooks and Reference Manuals'));
    assert.ok(!res.text.includes('Second Student'));
  });

  it('18. User 1 deletes the transaction', async () => {
    const res = await request(app)
      .delete(`/api/transactions/${createdTxId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);

    // Verify it is gone
    const check = await Transaction.findById(createdTxId);
    assert.equal(check, null);
  });
});
