import React from 'react';
import { useCurrency } from '../../hooks/useCurrency';

export const StatCard = ({
  title,
  amount,
  subtitle,
  icon: Icon,
  variant = 'default', // 'income', 'expense', 'savings', 'budget'
  badgeText
}) => {
  const { format } = useCurrency();

  const getVariantStyles = () => {
    switch (variant) {
      case 'income':
        return {
          iconBg: 'var(--accent-income-bg)',
          iconColor: 'var(--accent-income)',
          textColor: 'var(--accent-income)'
        };
      case 'expense':
        return {
          iconBg: 'var(--accent-expense-bg)',
          iconColor: 'var(--accent-expense)',
          textColor: 'var(--accent-expense)'
        };
      case 'savings':
        return {
          iconBg: 'var(--primary-light)',
          iconColor: 'var(--primary)',
          textColor: 'var(--primary)'
        };
      case 'budget':
        return {
          iconBg: 'var(--accent-info-bg)',
          iconColor: 'var(--accent-info)',
          textColor: 'var(--accent-info)'
        };
      default:
        return {
          iconBg: 'var(--bg-subtle)',
          iconColor: 'var(--text-secondary)',
          textColor: 'var(--text-primary)'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: styles.iconBg,
              color: styles.iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="mono-amount" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
        {format(amount)}
      </div>

      {(subtitle || badgeText) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          {badgeText && (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '11px',
                backgroundColor: styles.iconBg,
                color: styles.iconColor
              }}
            >
              {badgeText}
            </span>
          )}
          {subtitle && (
            <span style={{ color: 'var(--text-muted)' }}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
