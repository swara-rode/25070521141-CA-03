import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Alert';
import { transactionService } from '../../services/api';
import { formatDate } from '../../utils/formatters';

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

const DEFAULT_INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Allowance',
  'Scholarship',
  'Business',
  'Investment',
  'Gift',
  'Other'
];

const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other'
];

export const TransactionFormModal = ({
  isOpen,
  onClose,
  transaction = null, // null for new, object for edit
  defaultType = 'expense',
  onSuccess
}) => {
  const [type, setType] = useState(defaultType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(formatDate(new Date(), 'input'));
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Populate form if editing
  useEffect(() => {
    if (transaction) {
      setType(transaction.type || 'expense');
      setTitle(transaction.title || '');
      setAmount(transaction.amount?.toString() || '');
      setCategory(transaction.category || '');
      setDate(formatDate(transaction.date, 'input') || formatDate(new Date(), 'input'));
      setPaymentMethod(transaction.paymentMethod || 'UPI');
      setNotes(transaction.notes || '');
    } else {
      setType(defaultType);
      setTitle('');
      setAmount('');
      setCategory(defaultType === 'income' ? DEFAULT_INCOME_CATEGORIES[0] : DEFAULT_EXPENSE_CATEGORIES[0]);
      setDate(formatDate(new Date(), 'input'));
      setPaymentMethod('UPI');
      setNotes('');
    }
    setError(null);
  }, [transaction, defaultType, isOpen]);

  // Adjust default category when type toggles if current category is not in list
  const handleTypeChange = (newType) => {
    setType(newType);
    const list = newType === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;
    if (!list.includes(category)) {
      setCategory(list[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Front-end validation
    if (!title.trim()) {
      setError('Please provide a title for the transaction.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }

    if (!category) {
      setError('Please select a category.');
      return;
    }

    setLoading(true);

    const payload = {
      type,
      title: title.trim(),
      amount: numAmount,
      category,
      date,
      paymentMethod,
      notes: notes.trim()
    };

    try {
      if (transaction && transaction._id) {
        await transactionService.update(transaction._id, payload);
      } else {
        await transactionService.create(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentCategories = type === 'income' ? DEFAULT_INCOME_CATEGORIES : DEFAULT_EXPENSE_CATEGORIES;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? 'Edit Transaction' : 'Record Transaction'}
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Alert type="error" message={error} onClose={() => setError(null)} />

        {/* Type Toggle Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '4px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              backgroundColor: type === 'expense' ? 'var(--accent-expense)' : 'transparent',
              color: type === 'expense' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)'
            }}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              backgroundColor: type === 'income' ? 'var(--primary)' : 'transparent',
              color: type === 'income' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)'
            }}
          >
            Income
          </button>
        </div>

        {/* Title Input */}
        <div>
          <label htmlFor="tx-title" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Description / Title *
          </label>
          <input
            id="tx-title"
            type="text"
            required
            placeholder="e.g., Grocery shopping, Books, Monthly stipend"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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

        {/* Amount & Date Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label htmlFor="tx-amount" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Amount *
            </label>
            <input
              id="tx-amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
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

          <div>
            <label htmlFor="tx-date" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Date *
            </label>
            <input
              id="tx-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
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

        {/* Category & Payment Method Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label htmlFor="tx-category" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Category *
            </label>
            <select
              id="tx-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                fontSize: '14px',
                backgroundColor: '#fff',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {currentCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tx-payment" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Payment Method
            </label>
            <select
              id="tx-payment"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                fontSize: '14px',
                backgroundColor: '#fff',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes (Optional) */}
        <div>
          <label htmlFor="tx-notes" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Notes (Optional)
          </label>
          <textarea
            id="tx-notes"
            rows="2"
            placeholder="Additional context or invoice memo..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              fontSize: '14px',
              resize: 'vertical',
              outline: 'none'
            }}
          />
        </div>

        {/* Actions */}
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
            {loading ? 'Saving...' : transaction ? 'Update Record' : 'Save Record'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
