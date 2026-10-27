process.env.NODE_ENV = 'test';
const { describe, it, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const { escapeCSVCell, generateTransactionsCSV } = require('../utils/csvExporter');

after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

describe('API Health and Security Tests', () => {
  it('GET /api/health should return 200 with service health status', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.status, 'healthy');
    assert.ok(typeof res.body.uptimeSeconds === 'number');
    assert.ok(res.body.database !== undefined);
  });

  it('GET /api should return API root message', async () => {
    const res = await request(app).get('/api');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  it('Protected route GET /api/transactions should return 401 Unauthorized without token', async () => {
    const res = await request(app).get('/api/transactions');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('Access denied'));
  });

  it('Protected route GET /api/budgets should return 401 Unauthorized without token', async () => {
    const res = await request(app).get('/api/budgets');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('Protected route GET /api/dashboard/summary should return 401 Unauthorized without token', async () => {
    const res = await request(app).get('/api/dashboard/summary');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('Protected route GET /api/reports/summary should return 401 Unauthorized without token', async () => {
    const res = await request(app).get('/api/reports/summary');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('POST /api/auth/register should return 400 when fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com' });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it('POST /api/auth/register should return 400 when passwords do not match', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Student',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'MismatchPassword'
      });
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.message.includes('do not match'));
  });

  it('POST /api/auth/login should return 400 when email or password is empty', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it('Invalid route should return 404', async () => {
    const res = await request(app).get('/api/non-existent-route');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
  });
});

describe('CSV Export Utility Unit Tests', () => {
  it('should properly escape quotes, commas, and formula triggers', () => {
    assert.equal(escapeCSVCell('Hello, World'), '"Hello, World"');
    assert.equal(escapeCSVCell('She said "hi"'), '"She said ""hi"""');
    assert.equal(escapeCSVCell('=SUM(A1:A10)'), `"'=SUM(A1:A10)"`);
    assert.equal(escapeCSVCell(null), '""');
  });

  it('should format transaction rows to CSV format', () => {
    const sample = [
      {
        date: new Date('2026-03-15T00:00:00.000Z'),
        title: 'Books & Supplies',
        type: 'expense',
        category: 'Education',
        amount: 1500,
        paymentMethod: 'UPI',
        notes: 'Semester books'
      }
    ];

    const csv = generateTransactionsCSV(sample);
    assert.ok(csv.includes('"Date","Title","Type","Category","Amount","Payment Method","Notes"'));
    assert.ok(csv.includes('Books & Supplies'));
    assert.ok(csv.includes('1500.00'));
    assert.ok(csv.includes('Education'));
  });
});
