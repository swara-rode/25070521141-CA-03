import React from 'react';
import { Menu, Plus, Calendar } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';

export const Header = ({ title, subtitle, onOpenMobileMenu, onQuickAdd }) => {
  const { currency, changeCurrency } = useCurrency();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-light)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 20
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="mobile-menu-btn"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px'
          }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>

        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Date badge */}
        <div
          className="header-date"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-subtle)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-light)'
          }}
        >
          <Calendar size={14} />
          <span>{currentDate}</span>
        </div>

        {/* Currency Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label htmlFor="currency-select" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
            Currency:
          </label>
          <select
            id="currency-select"
            value={currency}
            onChange={(e) => changeCurrency(e.target.value)}
            style={{
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-medium)',
              backgroundColor: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>

        {/* Quick Add Button */}
        {onQuickAdd && (
          <button
            type="button"
            onClick={onQuickAdd}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'background-color var(--transition-fast)'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
          >
            <Plus size={16} />
            <span className="quick-add-text">Add Record</span>
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 991px) {
          .mobile-menu-btn {
            display: flex !important;
          }
        }
        @media (max-width: 640px) {
          .header-date {
            display: none !important;
          }
          .quick-add-text {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};
