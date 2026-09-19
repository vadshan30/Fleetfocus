import React, { useMemo, useState } from 'react';
import { parseISO, getDay, getHours } from 'date-fns';
import Icon from '../ui/Icon';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => `${i}:00`);

const SkeletonHeatmap = () => (
  <div className="h-[380px] animate-pulse space-y-1">
    {[...Array(7)].map((_, i) => (
      <div key={i} className="flex gap-1 h-10">
        <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded" />
        {[...Array(24)].map((_, j) => (
          <div key={j} className="flex-1 bg-slate-200 dark:bg-slate-700 rounded" />
        ))}
      </div>
    ))}
  </div>
);

const Tooltip = ({ cell }) => {
  if (!cell) return null;
  const { day, hour, count } = cell;
  const intensityLabels = ['None', 'Very Low', 'Low', 'Medium', 'High', 'Very High'];
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 min-w-[180px] pointer-events-none z-50">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 rounded-full bg-blue-500" />
        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
          {DAY_LABELS[day]} {hour}:00
        </span>
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400">Trips:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{count}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400">Intensity:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {intensityLabels[cell.intensity]} ({cell.intensity}/5)
          </span>
        </div>
      </div>
    </div>
  );
};

const TripHeatmap = ({
  trips = [],
  title = 'Trip Activity Heatmap',
  height = 380,
  isLoading = false,
}) => {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const heatmapData = useMemo(() => {
    const grid = Array.from({ length: 7 }, () => Array(24).fill(0));

    const completedTrips = trips.filter((t) => t.status === 'COMPLETED');

    completedTrips.forEach((trip) => {
      if (!trip.startTime) return;
      try {
        const date = parseISO(trip.startTime);
        const dayOfWeek = getDay(date);
        const hour = getHours(date);
        const westernDay = (dayOfWeek + 6) % 7;
        grid[westernDay][hour] += 1;
      } catch {
        // invalid date, skip
      }
    });

    return grid;
  }, [trips]);

  const maxCount = useMemo(
    () => Math.max(1, ...heatmapData.flat()),
    [heatmapData]
  );

  const getIntensity = (count) => {
    if (count === 0) return 0;
    const ratio = count / maxCount;
    if (ratio <= 0.2) return 1;
    if (ratio <= 0.4) return 2;
    if (ratio <= 0.6) return 3;
    if (ratio <= 0.8) return 4;
    return 5;
  };

  const INTENSITY_COLORS = [
    'bg-slate-100 dark:bg-slate-800',
    'bg-blue-100 dark:bg-blue-900/30',
    'bg-blue-300 dark:bg-blue-700/50',
    'bg-blue-500 dark:bg-blue-600',
    'bg-blue-700 dark:bg-blue-500',
    'bg-blue-900 dark:bg-blue-400',
  ];

  const cells = useMemo(() => {
    const result = [];
    heatmapData.forEach((dayArr, dayIndex) => {
      dayArr.forEach((count, hourIndex) => {
        const intensity = getIntensity(count);
        result.push({
          day: dayIndex,
          hour: hourIndex,
          count,
          intensity,
        });
      });
    });
    return result;
  }, [heatmapData]);

  const hasData = cells.some((c) => c.count > 0);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 animate-pulse">
            <Icon name="Activity" size={18} />
          </div>
          <div className="space-y-1">
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-3 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        </div>
        <SkeletonHeatmap />
      </div>
    );
  }

  const exportData = cells.filter((c) => c.count > 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 relative">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Icon name="Activity" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
              {title}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Trip starts by day of week and hour (completed trips only)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {trips.filter((t) => t.status === 'COMPLETED').length} Completed Trips
          </span>
          {hasData && (
            <ExportButton
              chartType="tripHeatmap"
              data={exportData}
              title="Trip Heatmap"
              subtitle="Day of week × hour of day trip distribution"
              filename="fleetfocus-trip-heatmap"
            />
          )}
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
          <Icon name="Activity" size={48} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">No trip data in selected range</p>
          <p className="text-[11px] mt-1">Complete trips to generate heatmap</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <div className="min-w-max relative">
              <div className="flex gap-1 mb-1 pl-16">
                {HOUR_LABELS.map((hour, i) => (
                  <div
                    key={i}
                    className="w-10 text-center text-[9px] font-medium text-slate-400 dark:text-slate-500"
                    style={{ minWidth: '28px' }}
                  >
                    {i % 3 === 0 ? hour : ''}
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                {DAY_LABELS.map((day, dayIndex) => (
                  <div key={dayIndex} className="flex gap-1 items-center">
                    <div className="w-16 text-right text-xs font-medium text-slate-500 dark:text-slate-400 pr-2 shrink-0">
                      {day}
                    </div>
                    <div className="flex-1 flex gap-1">
                      {HOUR_LABELS.map((_, hourIndex) => {
                        const cell = cells.find((c) => c.day === dayIndex && c.hour === hourIndex);
                        const count = cell?.count || 0;
                        const intensity = cell?.intensity || 0;
                        return (
                          <div
                            key={`${dayIndex}-${hourIndex}`}
                            className={`w-10 h-10 rounded transition-all duration-150 hover:scale-110 hover:shadow-md cursor-pointer ${INTENSITY_COLORS[intensity]}`}
                            style={{ minWidth: '28px' }}
                            onMouseEnter={(e) => {
                              setHoveredCell({ ...cell, day: dayIndex, hour: hourIndex });
                              const rect = e.currentTarget.getBoundingClientRect();
                              setTooltipPosition({
                                x: rect.left + rect.width / 2,
                                y: rect.top,
                              });
                            }}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            {count > 0 && count <= 9 && (
                              <span className="text-[8px] font-bold text-center block text-white dark:text-slate-900">
                                {count}
                              </span>
                            )}
                            {count >= 10 && (
                              <span className="text-[7px] font-bold text-center block text-white dark:text-slate-900">
                                9+
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Less</span>
              {[1, 2, 3, 4, 5].map((tier) => (
                <div
                  key={tier}
                  className={`w-6 h-4 rounded ${INTENSITY_COLORS[tier]} border border-slate-200 dark:border-slate-700`}
                />
              ))}
              <span>More</span>
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500">
              Max: {maxCount} trips/cell
            </div>
          </div>

          {hoveredCell && (
            <Tooltip
              cell={hoveredCell}
              style={{
                position: 'fixed',
                left: tooltipPosition.x,
                top: tooltipPosition.y - 10,
                transform: 'translateX(-50%) translateY(-100%)',
              }}
            />
          )}
        </>
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
        className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg:slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors flex items-center gap-1"
        title="Export as Excel"
      >
        <Icon name="Table" size={14} />
        <span>Excel</span>
      </button>
    </div>
  );
};

export default TripHeatmap;