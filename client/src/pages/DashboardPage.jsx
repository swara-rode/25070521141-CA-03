import React, { useState, useEffect, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  Plus,
  ArrowRight,
  Filter
} from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { CashFlowChart } from '../components/dashboard/CashFlowChart';
import { CategoryPieChart } from '../components/dashboard/CategoryPieChart';
import { TransactionList } from '../components/transactions/TransactionList';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { dashboardService } from '../services/api';
import { MONTHS, formatCurrency } from '../utils/formatters';
import { useCurrency } from '../hooks/useCurrency';

export const DashboardPage = () => {
  const { openQuickAdd } = useOutletContext();
  const { format } = useCurrency();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [summaryData, setSummaryData] = useState(null);
  const [trendsData, setTrendsData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, trendsRes, catRes] = await Promise.all([
        dashboardService.getSummary({ month: selectedMonth, year: selectedYear }),
        dashboardService.getTrends(),
        dashboardService.getCategoryBreakdown({ month: selectedMonth, year: selectedYear })
      ]);

      setSummaryData(summaryRes.data);
      setTrendsData(trendsRes.data?.trends || []);
      setCategoryData(catRes.data?.breakdown || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics. Check server status.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchDashboardData();

    const handleUpdate = () => {
      fetchDashboardData();
    };

    window.addEventListener('transaction:updated', handleUpdate);
    return () => window.removeEventListener('transaction:updated', handleUpdate);
  }, [fetchDashboardData]);

  if (loading && !summaryData) {
    return <LoadingSpinner text="Compiling financial insights..." fullPage />;
  }

  const monthly = summaryData?.monthly || {
    income: 0,
    expenses: 0,
    netSavings: 0,
    savingsRate: 0,
    budget: 0,
    budgetRemaining: 0,
    budgetUsagePercent: 0
  };

  const lifetime = summaryData?.lifetime || { income: 0, expenses: 0, balance: 0 };
  const recentTransactions = summaryData?.recentTransactions || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Filter Bar: Month & Year Selector & Quick Actions */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          backgroundColor: '#ffffff',
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
            <Filter size={16} />
            <span>Viewing Period:</span>
          </div>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: '#fff',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {MONTHS.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: '#fff',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={openQuickAdd}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-dark)',
              border: '1px solid var(--primary-border)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            <span>Quick Record</span>
          </button>
        </div>
      </div>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      {/* 4 Summary Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '20px'
        }}
      >
        <StatCard
          title="Monthly Income"
          amount={monthly.income}
          variant="income"
          icon={TrendingUp}
          subtitle={`for ${MONTHS[selectedMonth - 1]} ${selectedYear}`}
        />

        <StatCard
          title="Monthly Expenses"
          amount={monthly.expenses}
          variant="expense"
          icon={TrendingDown}
          subtitle={`for ${MONTHS[selectedMonth - 1]} ${selectedYear}`}
        />

        <StatCard
          title="Net Cash Flow"
          amount={monthly.netSavings}
          variant="savings"
          icon={PiggyBank}
          badgeText={`${monthly.savingsRate}% rate`}
          subtitle={monthly.netSavings >= 0 ? 'Surplus retained' : 'Deficit spent'}
        />

        <StatCard
          title="Budget Allocated"
          amount={monthly.budget}
          variant="budget"
          icon={Wallet}
          badgeText={`${monthly.budgetUsagePercent}% used`}
          subtitle={
            monthly.budget > 0
              ? `${format(Math.max(0, monthly.budgetRemaining))} remaining`
              : 'No budget set for month'
          }
        />
      </div>

      {/* Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px'
        }}
      >
        {/* Income vs Expenses Cash Flow Trends */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            padding: '22px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Cash Flow Trends (Past 6 Months)
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Income vs Expense volume over time
              </p>
            </div>
          </div>
          <CashFlowChart data={trendsData} />
        </div>

        {/* Category Expense Breakdown */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            padding: '22px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Category Breakdown ({MONTHS[selectedMonth - 1]})
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Proportional spending by category
              </p>
            </div>
          </div>
          <CategoryPieChart data={categoryData} />
        </div>
      </div>

      {/* Recent Transactions & Lifetime Summary Row */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Transactions
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Latest transactions recorded across all dates
            </p>
          </div>

          <Link
            to="/transactions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--primary)',
              textDecoration: 'none'
            }}
          >
            <span>View All Transactions</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <TransactionList
          transactions={recentTransactions}
          onRefresh={fetchDashboardData}
          emptyTitle="No recent transactions"
          emptyDescription="Start tracking your expenses and income to see insights here."
          onAddNew={openQuickAdd}
        />
      </div>

      {/* Lifetime Account Summary Pill */}
      <div
        style={{
          padding: '16px 20px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Lifetime Account Totals
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '13px' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Total Inflow: </span>
            <strong className="mono-amount" style={{ color: 'var(--accent-income)' }}>
              {format(lifetime.income)}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Total Outflow: </span>
            <strong className="mono-amount" style={{ color: 'var(--accent-expense)' }}>
              {format(lifetime.expenses)}
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Cumulative Net Balance: </span>
            <strong className="mono-amount" style={{ color: 'var(--text-primary)' }}>
              {format(lifetime.balance)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
