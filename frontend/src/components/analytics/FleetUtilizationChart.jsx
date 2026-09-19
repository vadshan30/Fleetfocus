import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays } from 'date-fns';
import Icon from '../ui/Icon';

const dateRangeOptions = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

const generateMockData = (days) => {
  const data = [];
  const baseUtilization = 65;
  const baseAvailable = 85;
  let utilization = baseUtilization;
  let available = baseAvailable;

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const displayDate = format(date, 'MMM d');

    utilization += (Math.random() - 0.5) * 8;
    utilization = Math.max(30, Math.min(95, utilization));

    available += (Math.random() - 0.5) * 6;
    available = Math.max(50, Math.min(100, available));

    data.push({
      date: dateStr,
      displayDate,
      utilization: Math.round(utilization * 10) / 10,
      available: Math.round(available * 10) / 10,
    });
  }
  return data;
};

const FULL_MOCK_DATA = generateMockData(90);

// ✅ Moved OUTSIDE the component
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 min-w-[140px]">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-700 dark:text-slate-200 capitalize">{entry.name}: </span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {entry.value}%
          </span>
        </div>
      ))}
    </div>
  );
};

const FleetUtilizationChart = ({
  data: propData,
  title = 'Fleet Utilization',
  height = 300,
}) => {
  const [dateRange, setDateRange] = useState('30d');
  const isMock = !propData;

  const chartData = useMemo(() => {
    const sourceData = propData || FULL_MOCK_DATA;
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
    // defensive sort by date ascending
    const sorted = [...sourceData].sort((a, b) =>
      String(a.date).localeCompare(String(b.date))
    );
    return sorted.slice(-days);
  }, [propData, dateRange]);

  const chartHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Icon name="TrendingUp" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              {title}
              {isMock && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Demo Data
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Fleet utilization vs availability over time
            </p>
          </div>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent cursor-pointer"
        >
          {dateRangeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              className="dark:stroke-slate-800"
              vertical={false}
            />
            <XAxis
              dataKey="displayDate"
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={24}
              dy={5}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
              dx={-5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 10 }}
              formatter={(value) => (
                <span className="capitalize text-xs font-medium text-slate-700 dark:text-slate-300">
                  {value}
                </span>
              )}
              iconType="circle"
              iconSize={8}
              layout="horizontal"
              align="center"
            />
            <Line
              type="monotone"
              dataKey="utilization"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 2.5, stroke: '#2563eb' }}
              activeDot={{ r: 5, strokeWidth: 2 }}
              name="Utilization"
              animationDuration={300}
            />
            <Line
              type="monotone"
              dataKey="available"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 2.5, stroke: '#10b981' }}
              activeDot={{ r: 5, strokeWidth: 2 }}
              name="Availability"
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FleetUtilizationChart;