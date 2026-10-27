import React, { useState, useEffect, useCallback } from 'react';
import { Plus, PiggyBank, Filter, AlertTriangle } from 'lucide-react';
import { BudgetCard } from '../components/budgets/BudgetCard';
import { BudgetFormModal } from '../components/budgets/BudgetFormModal';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { budgetService } from '../services/api';
import { MONTHS } from '../utils/formatters';
import { useCurrency } from '../hooks/useCurrency';

export const BudgetsPage = () => {
  const { format } = useCurrency();
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await budgetService.getAll({ month: selectedMonth, year: selectedYear });
      setBudgets(res.data?.budgets || []);
      setTotalAllocated(res.data?.totalAllocated || 0);
      setTotalSpent(res.data?.totalSpent || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch budgets.');
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (budget) => {
    setEditingBudget(budget);
    setModalOpen(true);
  };

  const totalRemaining = totalAllocated - totalSpent;
  const overallPercentage = totalAllocated > 0 ? Number(((totalSpent / totalAllocated) * 100).toFixed(1)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header: Period Filter & Add Button */}
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
            <span>Budget Period:</span>
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

        <button
          type="button"
          onClick={handleOpenAdd}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            padding: '9px 18px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Plus size={18} />
          <span>Set Category Budget</span>
        </button>
      </div>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      {/* Aggregate Budget Summary Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          padding: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          alignItems: 'center'
        }}
      >
        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Allocated Budget
          </span>
          <div className="mono-amount" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {format(totalAllocated)}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Across {budgets.length} configured {budgets.length === 1 ? 'category' : 'categories'}
          </span>
        </div>

        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total Spent in Categories
          </span>
          <div className="mono-amount" style={{ fontSize: '24px', fontWeight: 800, color: totalSpent > totalAllocated && totalAllocated > 0 ? 'var(--accent-expense)' : 'var(--text-primary)', marginTop: '4px' }}>
            {format(totalSpent)}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {overallPercentage}% total consumption
          </span>
        </div>

        <div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Overall Remaining Margin
          </span>
          <div className="mono-amount" style={{ fontSize: '24px', fontWeight: 800, color: totalRemaining >= 0 ? 'var(--primary)' : 'var(--accent-expense)', marginTop: '4px' }}>
            {format(totalRemaining)}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {totalRemaining >= 0 ? 'Within budget' : 'Over allocated limit'}
          </span>
        </div>
      </div>

      {/* Budgets Grid */}
      {loading ? (
        <LoadingSpinner text="Calculating budget thresholds..." />
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title={`No budgets set for ${MONTHS[selectedMonth - 1]} ${selectedYear}`}
          description="Allocate category budgets to monitor spending limits and receive timely warning alerts."
          actionText="Set First Budget"
          onAction={handleOpenAdd}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '20px'
          }}
        >
          {budgets.map((b) => (
            <BudgetCard
              key={b._id}
              budget={b}
              onEdit={handleOpenEdit}
              onRefresh={fetchBudgets}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <BudgetFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        budget={editingBudget}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onSuccess={fetchBudgets}
      />
    </div>
  );
};
