import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { useCurrency } from '../../hooks/useCurrency';
import { getCategoryColor } from '../../utils/formatters';

export const CategoryPieChart = ({ data = [] }) => {
  const { format } = useCurrency();

  if (!data || data.length === 0) {
    return (
      <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
        No category expenses recorded for this month.
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-md)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            fontSize: '13px'
          }}
        >
          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span className="mono-amount" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {format(item.value)}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>({item.payload.percentage}%)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={getCategoryColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
