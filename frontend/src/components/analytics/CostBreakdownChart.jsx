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
  if (!active || !payload || !payload.length) return null;

  const entry = payload[0];
  const total = payload.reduce((sum, p) => sum + (p.value || 0), 0);
  const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 min-w-[160px]">
      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2 capitalize">{entry.name}</p>
      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.payload?.fill || entry.color }} />
          <span className="text-slate-700 dark:text-slate-300 text-xs">Amount:</span>
        </div>
        <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-xs">
          ${Number(entry.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 text-sm mt-1">
        <span className="text-slate-500 dark:text-slate-400 text-xs">Share:</span>
        <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-xs">{percentage}%</span>
      </div>
    </div>
  );
};

const ExportButton = ({ chartType, data, title, subtitle, filename }) => {
  const { exportToPDF, exportToExcel, prepareChartExportData } = require('../../utils/exportUtils');

  const handleExportPDF = () => {
    const exportData = prepareChartExportData(data, chartType);
    exportToPDF(exportData, filename, title, subtitle);
  };

  const handleExportExcel = () => {
    const exportData = prepareChartExportData(data, chartType);
    exportToExcel(exportData, filename);
  };

  if (!data || data.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleExportPDF}
        className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors flex items-center gap-1"
        title="Export as PDF"
      >
        <Icon name="FileText" size={14} />
        <span>PDF</span>
      </button>
      <button
        type="button"
        onClick={handleExportExcel}
        className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors flex items-center gap-1"
        title="Export as Excel"
      >
        <Icon name="Table" size={14} />
        <span>Excel</span>
      </button>
    </div>
  );
};

const calculateBreakdown = (tripList, maintList, fuelPrice, fuelRate, tripRate) => {
  const completed = tripList.filter((t) => t.status === 'COMPLETED');
  const distance = completed.reduce((sum, t) => sum + (t.distanceCovered || 0), 0);
  const fuelCost = ((distance / 100) * fuelRate) * fuelPrice;
  const maintenanceCost = maintList.reduce((sum, l) => sum + (l.cost ?? 150), 0);
  const tripCost = distance * tripRate;

  const rawValues = {
    fuel: fuelCost,
    maintenance: maintenanceCost,
    trip: tripCost,
    other: 0,
  };

  return CATEGORIES.map((cat) => ({
    key: cat.key,
    name: cat.label,
    value: Math.round((rawValues[cat.key] || 0) * 100) / 100,
    color: cat.color,
  }));
};

const CostBreakdownChart = ({
  trips = [],
  tripsB = [],
  maintenanceLogs = [],
  maintenanceLogsB = [],
  fuelPricePerLiter = 1.8,
  fuelPer100Km = 8.5,
  tripCostPerKm = 0.15,
  otherCosts = 0,
  title = 'Cost Breakdown',
  height = 260,
  isLoading = false,
  compareMode = false,
  rangeALabel = 'Range A',
  rangeBLabel = 'Range B',
}) => {
  const chartDataA = useMemo(
    () => calculateBreakdown(trips, maintenanceLogs, fuelPricePerLiter, fuelPer100Km, tripCostPerKm),
    [trips, maintenanceLogs, fuelPricePerLiter, fuelPer100Km, tripCostPerKm]
  );

  const chartDataB = useMemo(
    () => calculateBreakdown(tripsB, maintenanceLogsB, fuelPricePerLiter, fuelPer100Km, tripCostPerKm),
    [tripsB, maintenanceLogsB, fuelPricePerLiter, fuelPer100Km, tripCostPerKm]
  );

  const totalCostA = useMemo(() => chartDataA.reduce((s, d) => s + d.value, 0), [chartDataA]);
  const totalCostB = useMemo(() => chartDataB.reduce((s, d) => s + d.value, 0), [chartDataB]);

  const costDelta = useMemo(() => {
    const diff = totalCostA - totalCostB;
    const pct = totalCostB > 0 ? (diff / totalCostB) * 100 : (totalCostA > 0 ? 100 : 0);
    return {
      diff,
      pct,
      direction: pct > 0.1 ? 'UP' : pct < -0.1 ? 'DOWN' : 'FLAT',
    };
  }, [totalCostA, totalCostB]);

  const hasDataA = chartDataA.some((d) => d.value > 0);
  const hasDataB = chartDataB.some((d) => d.value > 0);
  const hasData = hasDataA || (compareMode && hasDataB);

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
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Icon name="DollarSign" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              {title}
              {compareMode && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Dual Donut
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {compareMode
                ? `Cost distribution: ${rangeALabel} vs ${rangeBLabel}`
                : 'Fleet cost distribution by category'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {compareMode ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                A: ${totalCostA.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                B: ${totalCostB.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  costDelta.direction === 'UP'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                    : costDelta.direction === 'DOWN'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {costDelta.direction === 'UP' ? `↑ +${costDelta.pct.toFixed(1)}%` : costDelta.direction === 'DOWN' ? `↓ ${costDelta.pct.toFixed(1)}%` : '– 0%'}
              </span>
            </div>
          ) : (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              ${Number(totalCostA).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )}
          {hasData && (
            <ExportButton
              chartType="costBreakdown"
              data={chartDataA.filter((d) => d.value > 0)}
              title="Cost Breakdown"
              subtitle="Fleet cost distribution by category"
              filename="fleetfocus-cost-breakdown"
            />
          )}
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
          <Icon name="DollarSign" size={48} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">No cost data available</p>
          <p className="text-[11px] mt-1">Complete trips and maintenance to generate cost breakdown</p>
        </div>
      ) : compareMode ? (
        /* Side-by-Side Donuts in Compare Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-2">
          {/* Donut A */}
          <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50/50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800">
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
              {rangeALabel}
            </div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-2">
              ${totalCostA.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartDataA.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {chartDataA.filter((d) => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-a-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut B */}
          <div className="flex flex-col items-center p-3 rounded-xl bg-slate-50/50 dark:bg-slate-850/40 border border-slate-100 dark:border-slate-800">
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
              {rangeBLabel}
            </div>
            <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-2">
              ${totalCostB.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartDataB.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {chartDataB.filter((d) => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-b-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* Single Donut View */
        <div style={{ height: typeof height === 'number' ? `${height}px` : height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartDataA.filter((d) => d.value > 0)}
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
                {chartDataA.filter((d) => d.value > 0).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Breakdown Table */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {CATEGORIES.map((cat) => {
          const valA = chartDataA.find((c) => c.key === cat.key)?.value || 0;
          const valB = chartDataB.find((c) => c.key === cat.key)?.value || 0;
          const diff = valA - valB;

          return (
            <div key={cat.key} className="flex flex-col gap-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-slate-600 dark:text-slate-400 font-medium truncate">{cat.label}</span>
              </div>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="font-bold text-slate-900 dark:text-slate-100">${valA.toFixed(2)}</span>
                {compareMode && (
                  <span
                    className={`text-[10px] font-semibold ${
                      diff > 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : diff < 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {diff > 0 ? `+$${diff.toFixed(2)}` : diff < 0 ? `-$${Math.abs(diff).toFixed(2)}` : '$0'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CostBreakdownChart;