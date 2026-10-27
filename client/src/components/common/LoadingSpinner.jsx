import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading data...', size = 32, fullPage = false }) => {
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px' }}>
      <Loader2 size={size} className="animate-spin" style={{ color: 'var(--primary)' }} />
      {text && <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {content}
      </div>
    );
  }

  return content;
};
