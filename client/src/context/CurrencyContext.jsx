import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency, CURRENCY_SYMBOLS } from '../utils/formatters';

export const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const { user } = useAuth();
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('expense_tracker_currency') || user?.preferredCurrency || 'INR';
  });

  useEffect(() => {
    if (user?.preferredCurrency && !localStorage.getItem('expense_tracker_currency')) {
      setCurrency(user.preferredCurrency);
    }
  }, [user]);

  const changeCurrency = (newCurrency) => {
    if (['INR', 'USD', 'EUR'].includes(newCurrency)) {
      setCurrency(newCurrency);
      localStorage.setItem('expense_tracker_currency', newCurrency);
    }
  };

  const format = (amount) => formatCurrency(amount, currency);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        symbol: CURRENCY_SYMBOLS[currency] || '₹',
        changeCurrency,
        format
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
