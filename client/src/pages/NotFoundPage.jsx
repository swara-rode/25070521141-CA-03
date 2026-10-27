import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-page)'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--accent-expense-bg)',
          color: 'var(--accent-expense)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}
      >
        <AlertCircle size={32} />
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
        404 - Page Not Found
      </h1>
      <p style={{ fontSize: '15px', color: 'var(--text-muted)', maxWidth: '440px', marginBottom: '28px', lineHeight: 1.6 }}>
        The page you are looking for does not exist or has been moved to another location.
      </p>

      <Link
        to="/dashboard"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--primary)',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: 'var(--radius-md)',
          fontWeight: 700,
          fontSize: '14px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <Home size={16} />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
};
