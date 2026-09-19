import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from 'recharts';

const testData = [
  { date: '2026-09-01', value: 120 },
  { date: '2026-09-02', value: 180 },
  { date: '2026-09-03', value: 140 },
  { date: '2026-09-04', value: 220 },
  { date: '2026-09-05', value: 290 },
  { date: '2026-09-06', value: 240 },
  { date: '2026-09-07', value: 310 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-gray-200 dark:border-slate-700 rounded-lg shadow-md text-sm">
        <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{`Date: ${label}`}</p>
        <p className="text-blue-600 dark:text-blue-400 font-medium">{`Value: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const ChartTest = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 transition-colors duration-200">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Analytics Chart Test
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Temporary verification component for Recharts setup and dark mode responsiveness.
        </p>
      </div>

      <div className="w-full h-72 sm:h-80 md:h-96 p-2 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-100 dark:border-slate-700/50">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={testData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              tick={{ fill: 'currentColor', fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis
              stroke="#64748b"
              tick={{ fill: 'currentColor', fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 5, fill: '#3b82f6' }}
              activeDot={{ r: 8, fill: '#2563eb' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartTest;
