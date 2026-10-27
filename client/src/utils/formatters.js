export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€'
};

/**
 * Format numeric value as currency
 */
export const formatCurrency = (amount, currency = 'INR') => {
  const numericAmount = Number(amount) || 0;
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';

  if (currency === 'INR') {
    // Indian numbering format (e.g., ₹1,50,000.00)
    return `${symbol}${numericAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  return `${symbol}${numericAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Format ISO date string to user-friendly format
 */
export const formatDate = (dateString, format = 'medium') => {
  if (!dateString) return '';
  const date = new Date(dateString);

  if (isNaN(date.getTime())) return '';

  if (format === 'short') {
    // e.g. 15 Mar
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }

  if (format === 'input') {
    // e.g. 2026-03-15 for HTML date inputs
    return date.toISOString().split('T')[0];
  }

  // Medium: e.g. Mar 15, 2026
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Month names list
 */
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

/**
 * Color and badge styling for categories
 */
export const CATEGORY_COLORS = {
  'Food & Dining': '#f59e0b',
  'Transportation': '#3b82f6',
  'Shopping': '#ec4899',
  'Education': '#8b5cf6',
  'Entertainment': '#10b981',
  'Health': '#ef4444',
  'Bills & Utilities': '#6366f1',
  'Housing': '#14b8a6',
  'Travel': '#f97316',
  'Personal Care': '#06b6d4',
  'Salary': '#10b981',
  'Freelance': '#059669',
  'Allowance': '#3b82f6',
  'Scholarship': '#8b5cf6',
  'Business': '#6366f1',
  'Investment': '#0ea5e9',
  'Gift': '#ec4899',
  'Other': '#64748b'
};

export const getCategoryColor = (category) => {
  return CATEGORY_COLORS[category] || '#64748b';
};
