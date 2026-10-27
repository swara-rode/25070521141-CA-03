import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  CreditCard
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { reportsService } from '../services/api';
import { formatDate, getCategoryColor } from '../utils/formatters';
import { useCurrency } from '../hooks/useCurrency';

export const ReportsPage = () => {
  const { format } = useCurrency();

  // Date range presets
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(lastDayOfMonth);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportsService.getSummary({ startDate, endDate });
      setReportData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate financial reports.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleExportCSV = async () => {
    setExporting(true);
    setError(null);
    try {
      await reportsService.downloadCsv({ startDate, endDate });
      setSuccessMsg('Transaction report downloaded successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError('Failed to export CSV. Please check that the server is operational.');
    } finally {
      setExporting(false);
    }
  };

  const setRangePreset = (type) => {
    const now = new Date();
    if (type === 'this_month') {
      setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
      setEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]);
    } else if (type === 'last_30') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      setStartDate(past30.toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    } else if (type === 'ytd') {
      setStartDate(new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]);
      setEndDate(now.toISOString().split('T')[0]);
    }
  };

  const totals = reportData?.totals || { income: 0, expenses: 0, netSavings: 0, savingsRate: 0, transactionCount: 0 };
  const categories = reportData?.categoryBreakdown || [];
  const paymentMethods = reportData?.paymentBreakdown || [];
  const timeline = reportData?.timelineData || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Date Range & Export Header */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
          padding: '20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Range:</span>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              fontSize: '13px',
              outline: 'none'
            }}
          />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              fontSize: '13px',
              outline: 'none'
            }}
          />

          <div style={{ display: 'flex', gap: '6px', marginLeft: '6px' }}>
            <button
              type="button"
              onClick={() => setRangePreset('this_month')}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-subtle)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setRangePreset('last_30')}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-subtle)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Last 30 Days
            </button>
            <button
              type="button"
              onClick={() => setRangePreset('ytd')}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-medium)',
                backgroundColor: 'var(--bg-subtle)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Year to Date
            </button>
          </div>
        </div>

        {/* Download CSV Action */}
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={exporting}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--text-primary)',
            color: '#ffffff',
            padding: '9px 18px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '13px',
            border: 'none',
            cursor: exporting ? 'not-allowed' : 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <Download size={16} />
          <span>{exporting ? 'Generating CSV...' : 'Download CSV Export'}</span>
        </button>
      </div>

      <Alert type="error" message={error} onClose={() => setError(null)} />
      <Alert type="success" message={successMsg} onClose={() => setSuccessMsg(null)} />

      {/* Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}
      >
        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '18px 20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Period Inflow
          </div>
          <div className="mono-amount" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-income)', marginTop: '4px' }}>
            {format(totals.income)}
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '18px 20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Period Outflow
          </div>
          <div className="mono-amount" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-expense)', marginTop: '4px' }}>
            {format(totals.expenses)}
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '18px 20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Net Cash Flow
          </div>
          <div className="mono-amount" style={{ fontSize: '22px', fontWeight: 800, color: totals.netSavings >= 0 ? 'var(--primary)' : 'var(--accent-expense)', marginTop: '4px' }}>
            {format(totals.netSavings)}
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '18px 20px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Recorded Activity
          </div>
          <div className="mono-amount" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
            {totals.transactionCount} transactions
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Compiling financial report analytics..." />
      ) : (
        <>
          {/* Daily Timeline Area Chart */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              padding: '24px'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Daily Spending & Income Activity
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Day-by-day cash trajectory over the selected period
            </p>

            {timeline.length === 0 ? (
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                No daily activity recorded in this selected range.
              </div>
            ) : (
              <div style={{ width: '100%', height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
                    <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Breakdown Grids: Categories & Payment Methods */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Category Expenses Breakdown Table */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                padding: '22px'
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
                Expense Breakdown by Category
              </h3>

              {categories.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  No expense records found in this range.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {categories.map((c) => (
                    <div key={c.category} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.category}</span>
                        <span className="mono-amount" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {format(c.amount)} ({c.percentage}%)
                        </span>
                      </div>
                      <div style={{ height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${c.percentage}%`,
                            backgroundColor: getCategoryColor(c.category),
                            borderRadius: 'var(--radius-full)'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method Distribution */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-sm)',
                padding: '22px'
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
                Payment Method Usage
              </h3>

              {paymentMethods.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  No transactions found in this range.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {paymentMethods.map((pm) => (
                    <div
                      key={pm.method}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CreditCard size={16} style={{ color: 'var(--primary)' }} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {pm.method}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="mono-amount" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {format(pm.amount)}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {pm.count} {pm.count === 1 ? 'record' : 'records'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
