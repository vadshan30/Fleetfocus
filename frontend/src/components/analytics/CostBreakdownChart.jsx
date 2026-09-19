import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Icon from '../ui/Icon';

const CATEGORIES = [
  { key: 'fuel', label: 'Fuel Costs', color: '#2563eb' },
  { key: 'maintenance', label: 'Maintenance Costs', color: '#10b981' },
  { key: 'trip', label: 'Trip Costs', color: '#f59e0b' },
  { key: 'other', label: 'Other', color: '#f43f5e' },
];

const SkeletonPie = () => (
  <div className="flex items-center justify-center h-[260px] animate-pulse">
    <div className="relative w-48 h-48">
      <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full" />
      <div className="absolute inset-0 border-4 border-slate-300 dark:border-slate-600 rounded-full border-t-transparent animate-spin" />
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload) return null;

  const entry = payload[0];
  const total = payload.reduce((sum, p) => sum + p.value, 0);
  const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 min-w-[160px]">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 capitalize">{entry.name}</p>
      <div className="flex items-center gap-2 text-sm">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="text-slate-700 dark:text-slate-200">Amount:</span>
        <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">${Number(entry.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
      </div>
      <div className="flex items-center gap-2 text-sm mt-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="text-slate-700 dark:text-slate-200">Share:</span>
        <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">{percentage}%</span>
      </div>
    </div>
  );
};

const CostBreakdownChart = ({
  trips = [],
  maintenanceLogs = [],
  fuelPricePerLiter = 1.8,
  fuelPer100Km = 8.5,
  tripCostPerKm = 0.15,
  otherCosts = 0,
  title = 'Cost Breakdown',
  height = 260,
  isLoading = false,
}) => {
  const chartData = useMemo(() => {
    const completedTrips = trips.filter((t) => t.status === 'COMPLETED');
    const totalDistance = completedTrips.reduce((sum, t) => sum + (t.distanceCovered || 0), 0);

    const fuelUsed = (totalDistance / 100) * fuelPer100Km;
    const fuelCost = fuelUsed * fuelPricePerLiter;

    const maintenanceCost = maintenanceLogs.reduce((sum, log) => {
      const logCost = log.cost ?? 150;
      return sum + logCost;
    }, 0);

    const tripCost = totalDistance * tripCostPerKm;

    const otherCost = otherCosts;

    const rawValues = {
      fuel: fuelCost,
      maintenance: maintenanceCost,
      trip: tripCost,
      other: otherCost,
    };

    return CATEGORIES.map((cat) => {
      const raw = rawValues[cat.key] ?? 0;
      return {
        name: cat.label,
        value: Math.round(raw * 100) / 100,
        color: cat.color,
      };
    }).filter((d) => d.value > 0);
  }, [trips, maintenanceLogs, fuelPricePerLiter, fuelPer100Km, tripCostPerKm, otherCosts]);

  const totalCost = useMemo(
    () => chartData.reduce((sum, d) => sum + d.value, 0),
    [chartData]
  );

  const hasData = chartData.length > 0;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 animate-pulse">
              <Icon name="DollarSign" size={18} />
            </div>
            <div className="space-y-1">
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-3 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <SkeletonPie />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Icon name="DollarSign" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
              {title}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Fleet cost distribution by category
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          ${Number(totalCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
          <Icon name="DollarSign" size={48} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">No cost data available</p>
          <p className="text-[11px] mt-1">Complete trips and maintenance to generate cost breakdown</p>
        </div>
      ) : (
        <div style={{ height: typeof height === 'number' ? `${height}px` : height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                labelLine={false}
                startAngle={90}
                endAngle={450}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 justify-center">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-500 dark:text-slate-400">{entry.name}</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100 ml-auto">${Number(entry.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CostBreakdownChart;