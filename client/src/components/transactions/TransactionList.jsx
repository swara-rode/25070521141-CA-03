import React, { useState } from 'react';
import { Edit2, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Badge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';
import { formatDate, getCategoryColor } from '../../utils/formatters';
import { useCurrency } from '../../hooks/useCurrency';
import { transactionService } from '../../services/api';

export const TransactionList = ({
  transactions = [],
  onEdit,
  onRefresh,
  emptyTitle = 'No transactions found',
  emptyDescription = 'Record an income or expense to get started.',
  onAddNew
}) => {
  const { format } = useCurrency();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await transactionService.delete(deleteTarget._id);
      setDeleteTarget(null);
      onRefresh?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete transaction.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionText={onAddNew ? 'Add Transaction' : undefined}
        onAction={onAddNew}
      />
    );
  }

  return (
    <>
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-light)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                <th style={{ padding: '14px 20px', fontWeight: 700 }}>Transaction</th>
                <th style={{ padding: '14px 20px', fontWeight: 700 }}>Category</th>
                <th style={{ padding: '14px 20px', fontWeight: 700 }}>Method</th>
                <th style={{ padding: '14px 20px', fontWeight: 700 }}>Date</th>
                <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <tr
                    key={tx._id}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      transition: 'background-color var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-subtle)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    {/* Title & Notes */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: isIncome ? 'var(--accent-income-bg)' : 'var(--accent-expense-bg)',
                            color: isIncome ? 'var(--accent-income)' : 'var(--accent-expense)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {isIncome ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {tx.title}
                          </div>
                          {tx.notes && (
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {tx.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category Badge */}
                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: `${getCategoryColor(tx.category)}15`,
                          color: getCategoryColor(tx.category)
                        }}
                      >
                        {tx.category}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                      {tx.paymentMethod || 'Cash'}
                    </td>

                    {/* Date */}
                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      {formatDate(tx.date)}
                    </td>

                    {/* Amount */}
                    <td
                      className="mono-amount"
                      style={{
                        padding: '14px 20px',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: isIncome ? 'var(--accent-income)' : 'var(--accent-expense)'
                      }}
                    >
                      {isIncome ? '+' : '-'}{format(tx.amount)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => onEdit?.(tx)}
                          title="Edit transaction"
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
                          onClick={() => setDeleteTarget(tx)}
                          title="Delete transaction"
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${deleteTarget?.title}" (${format(deleteTarget?.amount || 0)})?`}
        confirmText="Yes, Delete"
        isLoading={isDeleting}
      />
    </>
  );
};
