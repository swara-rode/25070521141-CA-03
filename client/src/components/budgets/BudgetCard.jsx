import React, { useState } from 'react';
import { Edit2, Trash2, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { useCurrency } from '../../hooks/useCurrency';
import { budgetService } from '../../services/api';

export const BudgetCard = ({ budget, onEdit, onRefresh }) => {
  const { format } = useCurrency();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await budgetService.delete(budget._id);
      setShowConfirm(false);
      onRefresh?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete budget.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isExceeded = budget.status === 'exceeded';
  const isWarning = budget.status === 'warning';

  let statusBadgeVariant = 'income';
  let StatusIcon = CheckCircle;
  let statusText = 'Normal Spending';
  let progressColor = 'var(--primary)';

  if (isExceeded) {
    statusBadgeVariant = 'expense';
    StatusIcon = AlertCircle;
    statusText = 'Budget Exceeded';
    progressColor = 'var(--accent-expense)';
  } else if (isWarning) {
    statusBadgeVariant = 'warning';
    StatusIcon = AlertTriangle;
    statusText = 'Approaching Limit';
    progressColor = 'var(--accent-warning)';
  }

  // Cap visual bar at 100%
  const visualPercent = Math.min(100, Math.max(0, budget.percentageUsed || 0));

  return (
    <>
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: `1px solid ${isExceeded ? '#fecaca' : isWarning ? '#fde68a' : 'var(--border-light)'}`,
          boxShadow: 'var(--shadow-sm)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          position: 'relative'
        }}
      >
        {/* Header: Category & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {budget.category}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <Badge variant={statusBadgeVariant} size="sm">
                <StatusIcon size={12} />
                <span>{statusText}</span>
              </Badge>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={() => onEdit?.(budget)}
              title="Edit Budget"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Edit2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              title="Delete Budget"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-expense)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Amount Comparisons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Spent
            </div>
            <div className="mono-amount" style={{ fontSize: '18px', fontWeight: 700, color: isExceeded ? 'var(--accent-expense)' : 'var(--text-primary)' }}>
              {format(budget.spent)}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Allocated Limit
            </div>
            <div className="mono-amount" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {format(budget.amount)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
            <span>{budget.percentageUsed}% consumed</span>
            <span>
              {budget.remaining >= 0 ? `${format(budget.remaining)} left` : `${format(Math.abs(budget.remaining))} over limit`}
            </span>
          </div>

          <div
            style={{
              height: '8px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${visualPercent}%`,
                backgroundColor: progressColor,
                borderRadius: 'var(--radius-full)',
                transition: 'width 300ms ease'
              }}
            />
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Budget"
        message={`Are you sure you want to delete the "${budget.category}" budget of ${format(budget.amount)}?`}
        confirmText="Yes, Delete"
        isLoading={isDeleting}
      />
    </>
  );
};
