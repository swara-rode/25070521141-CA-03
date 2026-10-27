import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Alert';
import { budgetService } from '../../services/api';
import { MONTHS } from '../../utils/formatters';

const DEFAULT_EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Education',
  'Entertainment',
  'Health',
  'Bills & Utilities',
  'Housing',
  'Travel',
  'Personal Care',
  'Other'
];

export const BudgetFormModal = ({
  isOpen,
  onClose,
  budget = null,
  selectedMonth,
  selectedYear,
  onSuccess
}) => {
  const [category, setCategory] = useState(DEFAULT_EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(selectedMonth || new Date().getMonth() + 1);
  const [year, setYear] = useState(selectedYear || new Date().getFullYear());

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (budget) {
      setCategory(budget.category || DEFAULT_EXPENSE_CATEGORIES[0]);
      setAmount(budget.amount?.toString() || '');
      setMonth(budget.month || selectedMonth || new Date().getMonth() + 1);
      setYear(budget.year || selectedYear || new Date().getFullYear());
    } else {
      setCategory(DEFAULT_EXPENSE_CATEGORIES[0]);
      setAmount('');
      setMonth(selectedMonth || new Date().getMonth() + 1);
      setYear(selectedYear || new Date().getFullYear());
    }
    setError(null);
  }, [budget, selectedMonth, selectedYear, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive budget amount.');
      return;
    }

    setLoading(true);

    const payload = {
      category,
      amount: numAmount,
      month: parseInt(month, 10),
      year: parseInt(year, 10)
    };

    try {
      if (budget && budget._id) {
        await budgetService.update(budget._id, payload);
      } else {
        await budgetService.create(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save budget.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={budget ? 'Edit Budget Allocation' : 'Set Category Budget'}
      maxWidth="460px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Alert type="error" message={error} onClose={() => setError(null)} />

        {/* Category */}
        <div>
          <label htmlFor="budget-category" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Expense Category *
          </label>
          <select
            id="budget-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={!!budget} // Prevent changing category in edit mode to avoid clashes
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              fontSize: '14px',
              backgroundColor: '#fff',
              outline: 'none',
              cursor: budget ? 'not-allowed' : 'pointer'
            }}
          >
            {DEFAULT_EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="budget-amount" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Allocated Limit *
          </label>
          <input
            id="budget-amount"
            type="number"
            step="1"
            min="1"
            required
            placeholder="e.g. 5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
              outline: 'none'
            }}
          />
        </div>

        {/* Month & Year */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label htmlFor="budget-month" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Month *
            </label>
            <select
              id="budget-month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                fontSize: '14px',
                backgroundColor: '#fff',
                outline: 'none'
              }}
            >
              {MONTHS.map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="budget-year" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Year *
            </label>
            <input
              id="budget-year"
              type="number"
              min="2020"
              max="2035"
              required
              value={year}
              onChange={(e) => setYear(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              backgroundColor: '#fff',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 22px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Saving...' : budget ? 'Update Budget' : 'Save Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
