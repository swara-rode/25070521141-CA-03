import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  style = {}
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'income':
        return {
          backgroundColor: 'var(--accent-income-bg)',
          color: 'var(--accent-income-text)',
          border: '1px solid #a7f3d0'
        };
      case 'expense':
        return {
          backgroundColor: 'var(--accent-expense-bg)',
          color: 'var(--accent-expense-text)',
          border: '1px solid #fecaca'
        };
      case 'warning':
        return {
          backgroundColor: 'var(--accent-warning-bg)',
          color: 'var(--accent-warning-text)',
          border: '1px solid #fde68a'
        };
      case 'info':
        return {
          backgroundColor: 'var(--accent-info-bg)',
          color: 'var(--accent-info-text)',
          border: '1px solid #bfdbfe'
        };
      case 'neutral':
      default:
        return {
          backgroundColor: 'var(--bg-subtle)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-light)'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '2px 8px', fontSize: '11px' };
      case 'lg':
        return { padding: '6px 14px', fontSize: '14px' };
      case 'md':
      default:
        return { padding: '4px 10px', fontSize: '12px' };
    }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        lineHeight: 1.2,
        letterSpacing: '0.02em',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style
      }}
    >
      {children}
    </span>
  );
};
