import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Icon from '../ui/Icon';

const SkeletonBar = ({ index, count }) => (
  <div className="flex items-end gap-3 h-[300px] p-4 animate-pulse">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex-1 flex flex-col items-center justify-end">
        <div className="w-full max-w-[48px] h-[200px] bg-slate-200 dark:bg-slate-700 rounded-t animate-pulse" />
        <div className="w-full max-w-[48px] h-8 bg-slate-200 dark:bg-slate-700 rounded mt-2 animate-pulse" />
      </div>
    ))}
  </div>
);

const CustomTooltip = ({ active, payload, label, compareMode }) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 min-w-[160px]">
      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-700 dark:text-slate-300 capitalize text-xs">
              {entry.name}:
            </span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-xs">
            {entry.value}
          </span>
        </div>
      ))}
      {compareMode && payload.length >= 2 && (
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs flex justify-between items-center">
          <span className="text-slate-500 dark:text-slate-400">Change:</span>
          {(() => {
            const diff = (payload[0]?.value || 0) - (payload[1]?.value || 0);
            const isPos = diff > 0;
            const isZero = diff === 0;
            return (
              <span
                className={`font-bold tabular-nums ${
                  isZero
                    ? 'text-slate-500'
                    : isPos
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {isZero ? '– 0' : `${isPos ? '+' : ''}${diff}`}
              </span>
            );
          })()}
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

const DriverComparisonChart = ({
  drivers = [],
  trips = [],
  tripsB = [],
  title = 'Driver Trip Comparison',
  height = 300,
  isLoading = false,
  compareMode = false,
  rangeALabel = 'Range A',
  rangeBLabel = 'Range B',
}) => {
  const chartData = useMemo(() => {
    if (!drivers.length) return [];

    return drivers
      .map((driver) => {
        const driverTripsA = trips.filter((t) => t.driver?.id === driver.id);
        const driverTripsB = tripsB.filter((t) => t.driver?.id === driver.id);
        const completedTrips = driverTripsA.filter((t) => t.status === 'COMPLETED');

        return {
          name: driver.user?.username || driver.name || `Driver ${String(driver.id).slice(-4)}`,
          totalTrips: driverTripsA.length,
          completedTrips: completedTrips.length,
          tripsA: driverTripsA.length,
          tripsB: driverTripsB.length,
        };
      })
      .filter((d) =>
        compareMode
          ? d.tripsA > 0 || d.tripsB > 0
          : d.totalTrips > 0 || d.completedTrips > 0
      );
  }, [drivers, trips, tripsB, compareMode]);

  const hasData = chartData.length > 0;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 animate-pulse">
              <Icon name="Users" size={18} />
            </div>
            <div className="space-y-1">
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-3 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <SkeletonBar count={Math.min(6, drivers.length || 5)} />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Icon name="Users" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              {title}
              {compareMode && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Side-by-Side
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {compareMode
                ? `Trips in ${rangeALabel} vs ${rangeBLabel} per driver`
                : 'Total vs completed trips per driver'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {chartData.length} Drivers
          </span>
          {hasData && (
            <ExportButton
              chartType="driverComparison"
              data={chartData}
              title="Driver Trip Comparison"
              subtitle="Total vs completed trips per driver"
              filename="fleetfocus-driver-comparison"
            />
          )}
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
          <Icon name="Users" size={48} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">No driver trip data available</p>
          <p className="text-[11px] mt-1">Complete trips to generate comparison chart</p>
        </div>
      ) : (
        <div className="h-[300px]" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                className="dark:stroke-slate-800"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, 'dataMax']}
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => Math.round(value)}
                dx={-5}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                width={100}
                interval={0}
                dy={5}
              />
              <Tooltip content={<CustomTooltip compareMode={compareMode} />} />
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
              {compareMode ? (
                <>
                  <Bar
                    dataKey="tripsA"
                    name={rangeALabel || 'Range A Trips'}
                    fill="#2563eb"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={22}
                  />
                  <Bar
                    dataKey="tripsB"
                    name={rangeBLabel || 'Range B Trips'}
                    fill="#818cf8"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={22}
                  />
                </>
              ) : (
                <>
                  <Bar
                    dataKey="totalTrips"
                    name="Total Trips"
                    fill="#2563eb"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="completedTrips"
                    name="Completed Trips"
                    fill="#10b981"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={28}
                  />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default DriverComparisonChart;