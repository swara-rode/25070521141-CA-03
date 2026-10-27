import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';
import { TransactionFormModal } from '../components/transactions/TransactionFormModal';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your personal finances' },
  '/transactions': { title: 'Transactions', subtitle: 'Detailed record of income and expenses' },
  '/budgets': { title: 'Monthly Budgets', subtitle: 'Set and monitor your spending limits' },
  '/reports': { title: 'Reports & Analytics', subtitle: 'Comprehensive financial breakdowns and export' },
  '/profile': { title: 'Profile & Settings', subtitle: 'Manage your account and preferences' }
};

export const DashboardLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const location = useLocation();

  const currentMeta = pageTitles[location.pathname] || {
    title: 'ExpenseTracker',
    subtitle: 'Smart Financial Management'
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)', display: 'flex' }}>
      {/* Sidebar navigation */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main content wrapper */}
      <div
        className="main-layout-content"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: '260px' // desktop sidebar width
        }}
      >
        <Header
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onQuickAdd={() => setIsQuickAddOpen(true)}
        />

        <main style={{ padding: '24px', flex: 1 }}>
          <Outlet context={{ openQuickAdd: () => setIsQuickAddOpen(true) }} />
        </main>
      </div>

      {/* Quick Add Modal */}
      <TransactionFormModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={() => {
          setIsQuickAddOpen(false);
          // Broadcast custom event so active page refetches data smoothly
          window.dispatchEvent(new Event('transaction:updated'));
        }}
      />

      <style>{`
        @media (max-width: 991px) {
          .main-layout-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};
