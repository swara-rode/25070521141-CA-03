import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const alertStyles = {
  success: {
    bg: 'var(--accent-income-bg)',
    color: 'var(--accent-income-text)',
    border: '#a7f3d0',
    icon: CheckCircle2
  },
  error: {
    bg: 'var(--accent-expense-bg)',
    color: 'var(--accent-expense-text)',
    border: '#fecaca',
    icon: AlertCircle
  },
  warning: {
    bg: 'var(--accent-warning-bg)',
    color: 'var(--accent-warning-text)',
    border: '#fde68a',
    icon: AlertTriangle
  },
  info: {
    bg: 'var(--accent-info-bg)',
    color: 'var(--accent-info-text)',
    border: '#bfdbfe',
    icon: Info
  }
};

export const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  if (!message) return null;

  const style = alertStyles[type] || alertStyles.info;
  const Icon = style.icon;

  return (
    <div
      className={`animate-fade-in ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: 500,
        marginBottom: '16px',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Icon size={18} style={{ flexShrink: 0 }} />
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.7
          }}
          aria-label="Dismiss alert"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
