import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Wallet,
  TrendingUp,
  PieChart,
  ShieldCheck,
  Download,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  // If already logged in, redirect straight to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* Navigation Bar */}
      <header
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border-light)',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <Wallet size={20} />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            ExpenseTracker
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            to="/login"
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            Log in
          </Link>
          <Link
            to="/register"
            style={{
              padding: '8px 18px',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1 }}>
        <section
          style={{
            padding: '72px 24px 64px 24px',
            maxWidth: '1100px',
            margin: '0 auto',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary-dark)',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '24px',
              border: '1px solid var(--primary-border)'
            }}
          >
            <ShieldCheck size={16} />
            <span>CA-03 Full-Stack Web Development Project</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              marginBottom: '20px'
            }}
          >
            Smart Personal Finance <br />
            <span style={{ color: 'var(--primary)' }}>Built for Clarity & Control</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(16px, 2vw, 19px)',
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              margin: '0 auto 36px auto',
              lineHeight: 1.6
            }}
          >
            Record daily spending, monitor category budgets, analyze monthly cash flow,
            and export detailed reports through an elegant, intuitive dashboard.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px'
            }}
          >
            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 26px',
                fontSize: '15px',
                fontWeight: 700,
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
                transition: 'all var(--transition-fast)'
              }}
            >
              <span>Create Free Account</span>
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: 600,
                backgroundColor: '#ffffff',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              Sign In to Your Dashboard
            </Link>
          </div>
        </section>

        {/* Feature Cards Grid */}
        <section
          style={{
            maxWidth: '1100px',
            margin: '0 auto 80px auto',
            padding: '0 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              padding: '28px 24px'
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-income-bg)',
                color: 'var(--accent-income)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}
            >
              <TrendingUp size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Income & Expense Tracking
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Log transactions seamlessly with categories, payment methods (UPI, Cash, Cards), dates, and notes. Filter and search with ease.
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              padding: '28px 24px'
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-warning-bg)',
                color: 'var(--accent-warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}
            >
              <PieChart size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Category Budgets & Alerts
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Set monthly spending thresholds for each category. Dynamic progress bars visually signal normal, warning, and exceeded status.
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              padding: '28px 24px'
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-info-bg)',
                color: 'var(--accent-info)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}
            >
              <Download size={22} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Reports & CSV Export
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Analyze spending trends with interactive Recharts visualizations and download clean, RFC 4180-compliant CSV exports anytime.
            </p>
          </div>
        </section>

        {/* Project Attribution Banner */}
        <section
          style={{
            maxWidth: '1100px',
            margin: '0 auto 60px auto',
            padding: '24px',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Academic Submission Details
            </span>
            <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              Student: Swara Rode • PRN: 25070521141
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Course: Full-Stack Web Development • Repository: 25070521141-CA-03
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 600, fontSize: '14px' }}>
            <CheckCircle2 size={18} />
            <span>MERN Stack (MongoDB, Express, React, Node)</span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--border-light)',
          padding: '24px 32px',
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--text-muted)'
        }}
      >
        <p>© 2026 ExpenseTracker • Student PRN: 25070521141. All rights reserved.</p>
      </footer>
    </div>
  );
};
