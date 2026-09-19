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

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 min-w-[160px]">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-700 dark:text-slate-200 capitalize">
            {entry.name}:{' '}
          </span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const DriverComparisonChart = ({
  drivers = [],
  trips = [],
  title = 'Driver Trip Comparison',
  height = 300,
  isLoading = false,
}) => {
  const chartData = useMemo(() => {
    if (!drivers.length || !trips.length) return [];

    return drivers.map((driver) => {
      const driverTrips = trips.filter((t) => t.driver?.id === driver.id);
      const completedTrips = driverTrips.filter((t) => t.status === 'COMPLETED');

      return {
        name: driver.user?.username || driver.name || `Driver ${driver.id.slice(-4)}`,
        totalTrips: driverTrips.length,
        completedTrips: completedTrips.length,
      };
    }).filter((d) => d.totalTrips > 0 || d.completedTrips > 0);
  }, [drivers, trips]);

  const maxTrips = useMemo(() => {
    if (!chartData.length) return 10;
    return Math.max(...chartData.flatMap((d) => [d.totalTrips, d.completedTrips]));
  }, [chartData]);

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
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Icon name="Users" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
              {title}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Total vs completed trips per driver
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          {chartData.length} Drivers
        </span>
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
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 10 }}
                formatter={(value) => (
                  <span className="capitalize text-xs font-medium text-slate-700 dark:text-slate-300">
                    {value.replace('Trips', '').trim() || value}
                  </span>
                )}
                iconType="circle"
                iconSize={8}
                layout="horizontal"
                align="center"
              />
              <Bar
                dataKey="totalTrips"
                name="Total Trips"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`total-${index}`} fill="#2563eb" />
                ))}
              </Bar>
              <Bar
                dataKey="completedTrips"
                name="Completed Trips"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`completed-${index}`} fill="#10b981" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const Cell = ({ children, fill }) => (
  <rect fill={fill} />
);

export default DriverComparisonChart;