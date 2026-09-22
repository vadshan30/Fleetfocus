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
import { format, subDays, parseISO, isWithinInterval, startOfDay, endOfDay, differenceInDays } from 'date-fns';
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
      utilizationB: Math.max(25, Math.round((utilization - 5 + Math.random() * 10) * 10) / 10),
      availableB: Math.max(45, Math.round((available - 4 + Math.random() * 8) * 10) / 10),
    });
  }
  return data;
};

const FULL_MOCK_DATA = generateMockData(90);

const CustomTooltip = ({ active, payload, label, compareMode, rangeALabel, rangeBLabel }) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 min-w-[180px]">
      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">{label}</p>
      {compareMode && (
        <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 mb-1">
          {rangeALabel || 'Range A (Current)'}
        </div>
      )}
      {payload
        .filter((entry) => !entry.dataKey.endsWith('B'))
        .map((entry, index) => (
          <div key={`a-${index}`} className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-700 dark:text-slate-200 capitalize">{entry.name}: </span>
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {entry.value}%
            </span>
          </div>
        ))}

      {compareMode && payload.some((entry) => entry.dataKey.endsWith('B')) && (
        <>
          <div className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400 mt-2.5 mb-1 pt-1.5 border-t border-slate-100 dark:border-slate-700/60">
            {rangeBLabel || 'Range B (Comparison)'}
          </div>
          {payload
            .filter((entry) => entry.dataKey.endsWith('B'))
            .map((entry, index) => (
              <div key={`b-${index}`} className="flex items-center justify-between gap-4 text-xs opacity-85">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-slate-700 dark:text-slate-200 capitalize">{entry.name}: </span>
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {entry.value}%
                </span>
              </div>
            ))}
        </>
      )}
    </div>
  );
};

const FleetUtilizationChart = ({
  trips = [],
  tripsB = [],
  vehicles = [],
  title = 'Fleet Utilization',
  height = 300,
  isLoading = false,
  compareMode = false,
  rangeA = null,
  rangeB = null,
  rangeALabel = 'Range A',
  rangeBLabel = 'Range B',
}) => {
  const [dateRange, setDateRange] = useState('30d');

  const hasRealData = trips.length > 0 && vehicles.length > 0;

  const chartData = useMemo(() => {
    if (!hasRealData) {
      const sourceData = FULL_MOCK_DATA;
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      return [...sourceData].sort((a, b) => String(a.date).localeCompare(String(b.date))).slice(-days);
    }

    let startA, endA, endB, days;

    if (rangeA && rangeA.startDate && rangeA.endDate) {
      startA = startOfDay(parseISO(rangeA.startDate));
      endA = endOfDay(parseISO(rangeA.endDate));
      days = Math.max(1, differenceInDays(endA, startA) + 1);
    } else {
      endA = endOfDay(new Date());
      days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      startA = startOfDay(subDays(endA, days - 1));
    }

    if (compareMode && rangeB && rangeB.startDate && rangeB.endDate) {
      endB = endOfDay(parseISO(rangeB.endDate));
    } else {
      endB = subDays(startA, 1);
    }

    const data = [];
    const totalVehicles = vehicles.length;

    for (let i = 0; i < days; i++) {
      const currentDayA = subDays(endA, days - 1 - i);
      const dateStrA = format(currentDayA, 'yyyy-MM-dd');
      const displayDateA = format(currentDayA, 'MMM d');
      const dayStartA = startOfDay(currentDayA);
      const dayEndA = endOfDay(currentDayA);

      const inUseA = trips.filter((t) => {
        if (!t.startTime) return false;
        try {
          const tripStart = parseISO(t.startTime);
          return isWithinInterval(tripStart, { start: dayStartA, end: dayEndA });
        } catch {
          return false;
        }
      }).length;

      const utilizationA = totalVehicles > 0 ? Math.round((inUseA / totalVehicles) * 1000) / 10 : 0;
      const availableA = totalVehicles > 0 ? Math.round(((totalVehicles - inUseA) / totalVehicles) * 1000) / 10 : 0;

      let utilizationB = 0;
      let availableB = 0;

      if (compareMode) {
        const currentDayB = subDays(endB, days - 1 - i);
        const dayStartB = startOfDay(currentDayB);
        const dayEndB = endOfDay(currentDayB);

        const inUseB = tripsB.filter((t) => {
          if (!t.startTime) return false;
          try {
            const tripStart = parseISO(t.startTime);
            return isWithinInterval(tripStart, { start: dayStartB, end: dayEndB });
          } catch {
            return false;
          }
        }).length;

        utilizationB = totalVehicles > 0 ? Math.round((inUseB / totalVehicles) * 1000) / 10 : 0;
        availableB = totalVehicles > 0 ? Math.round(((totalVehicles - inUseB) / totalVehicles) * 1000) / 10 : 0;
      }

      data.push({
        date: dateStrA,
        displayDate: displayDateA,
        utilization: utilizationA,
        available: availableA,
        ...(compareMode ? { utilizationB, availableB } : {}),
      });
    }
    return data;
  }, [trips, tripsB, vehicles, dateRange, hasRealData, compareMode, rangeA, rangeB]);

  const chartHeight = typeof height === 'number' ? `${height}px` : height;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 animate-pulse">
              <Icon name="TrendingUp" size={18} />
            </div>
            <div className="space-y-1">
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-3 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded w-full h-2/3" />
        </div>
      </div>
    );
  }

  const hasDataInRange = chartData.some(
    (d) => d.utilization > 0 || d.available > 0 || (compareMode && (d.utilizationB > 0 || d.availableB > 0))
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Icon name="TrendingUp" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              {title}
              {compareMode && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  4-Line Comparison
                </span>
              )}
              {!hasRealData && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Demo Data
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {compareMode
                ? `${rangeALabel} (solid) vs ${rangeBLabel} (dashed, 60% opacity)`
                : 'Fleet utilization vs availability over time'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!rangeA && (
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
          )}
          {hasRealData && hasDataInRange && (
            <ExportButton
              chartType="fleetUtilization"
              data={chartData}
              title="Fleet Utilization"
              subtitle="Daily utilization and availability percentage"
              filename="fleetfocus-fleet-utilization"
            />
          )}
        </div>
      </div>

      {!hasRealData ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
          <Icon name="TrendingUp" size={48} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">No trip data available</p>
          <p className="text-[11px] mt-1">Showing demo data — connect trips to see real utilization</p>
        </div>
      ) : !hasDataInRange ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
          <Icon name="TrendingUp" size={48} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">No activity in selected date range</p>
          <p className="text-[11px] mt-1">Try expanding the date range or check trip data</p>
        </div>
      ) : (
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
              <Tooltip
                content={
                  <CustomTooltip
                    compareMode={compareMode}
                    rangeALabel={rangeALabel}
                    rangeBLabel={rangeBLabel}
                  />
                }
              />
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
              {/* Range A Lines */}
              <Line
                type="monotone"
                dataKey="utilization"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 2.5, stroke: '#2563eb' }}
                activeDot={{ r: 5, strokeWidth: 2 }}
                name={compareMode ? `Utilization (${rangeALabel || 'A'})` : 'Utilization'}
                animationDuration={300}
              />
              <Line
                type="monotone"
                dataKey="available"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3, strokeWidth: 2.5, stroke: '#10b981' }}
                activeDot={{ r: 5, strokeWidth: 2 }}
                name={compareMode ? `Availability (${rangeALabel || 'A'})` : 'Availability'}
                animationDuration={300}
              />

              {/* Range B Lines (Compare Mode Only - 60% opacity dashed) */}
              {compareMode && (
                <Line
                  type="monotone"
                  dataKey="utilizationB"
                  stroke="#2563eb"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  dot={{ r: 2.5, strokeWidth: 2, stroke: '#2563eb', strokeOpacity: 0.6 }}
                  activeDot={{ r: 4, strokeWidth: 2 }}
                  name={`Utilization (${rangeBLabel || 'B'})`}
                  animationDuration={300}
                />
              )}
              {compareMode && (
                <Line
                  type="monotone"
                  dataKey="availableB"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  dot={{ r: 2.5, strokeWidth: 2, stroke: '#10b981', strokeOpacity: 0.6 }}
                  activeDot={{ r: 4, strokeWidth: 2 }}
                  name={`Availability (${rangeBLabel || 'B'})`}
                  animationDuration={300}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
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

export default FleetUtilizationChart;