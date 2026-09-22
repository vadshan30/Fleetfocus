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

const Tooltip = ({ cell, compareMode, rangeALabel, rangeBLabel }) => {
  if (!cell) return null;
  const { day, hour, count, countB = 0, diff = 0 } = cell;
  const intensityLabels = ['None', 'Very Low', 'Low', 'Medium', 'High', 'Very High'];

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 min-w-[190px] pointer-events-none z-50">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-3 h-3 rounded-full ${
            compareMode
              ? diff > 0
                ? 'bg-emerald-500'
                : diff < 0
                ? 'bg-rose-500'
                : 'bg-slate-400'
              : 'bg-blue-500'
          }`}
        />
        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
          {DAY_LABELS[day]} {hour}:00
        </span>
      </div>
      {compareMode ? (
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">{rangeALabel || 'Range A'}:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{count} trips</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">{rangeBLabel || 'Range B'}:</span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">{countB} trips</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60 font-bold">
            <span className="text-slate-600 dark:text-slate-300">Period Net Change:</span>
            <span
              className={
                diff > 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : diff < 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-400'
              }
            >
              {diff > 0 ? `+${diff}` : diff} trips
            </span>
          </div>
        </div>
      ) : (
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
      )}
    </div>
  );
};

const buildGrid = (tripList) => {
  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  const completed = tripList.filter((t) => t.status === 'COMPLETED');
  completed.forEach((trip) => {
    if (!trip.startTime) return;
    try {
      const date = parseISO(trip.startTime);
      const dayOfWeek = getDay(date);
      const hour = getHours(date);
      const westernDay = (dayOfWeek + 6) % 7;
      grid[westernDay][hour] += 1;
    } catch {
      // ignore invalid
    }
  });
  return grid;
};

const TripHeatmap = ({
  trips = [],
  tripsB = [],
  title = 'Trip Activity Heatmap',
  height = 380,
  isLoading = false,
  compareMode = false,
  rangeALabel = 'Range A',
  rangeBLabel = 'Range B',
}) => {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const gridA = useMemo(() => buildGrid(trips), [trips]);
  const gridB = useMemo(() => (compareMode ? buildGrid(tripsB) : null), [tripsB, compareMode]);

  const maxCount = useMemo(() => Math.max(1, ...gridA.flat()), [gridA]);
  const maxDiff = useMemo(() => {
    if (!compareMode || !gridB) return 1;
    let max = 1;
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        const diff = Math.abs(gridA[d][h] - gridB[d][h]);
        if (diff > max) max = diff;
      }
    }
    return max;
  }, [gridA, gridB, compareMode]);

  const getIntensity = (count) => {
    if (count === 0) return 0;
    const ratio = count / maxCount;
    if (ratio <= 0.2) return 1;
    if (ratio <= 0.4) return 2;
    if (ratio <= 0.6) return 3;
    if (ratio <= 0.8) return 4;
    return 5;
  };

  const getDiffColor = (diff) => {
    if (diff === 0) return 'bg-slate-100 dark:bg-slate-800 text-slate-400';
    const ratio = Math.abs(diff) / maxDiff;
    if (diff > 0) {
      if (ratio <= 0.3) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300';
      if (ratio <= 0.6) return 'bg-emerald-300 dark:bg-emerald-700/50 text-emerald-900 dark:text-emerald-100 font-bold';
      return 'bg-emerald-500 dark:bg-emerald-500 text-white font-extrabold';
    } else {
      if (ratio <= 0.3) return 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300';
      if (ratio <= 0.6) return 'bg-rose-300 dark:bg-rose-700/50 text-rose-900 dark:text-rose-100 font-bold';
      return 'bg-rose-500 dark:bg-rose-500 text-white font-extrabold';
    }
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
    gridA.forEach((dayArr, dayIndex) => {
      dayArr.forEach((countA, hourIndex) => {
        const countB = gridB ? gridB[dayIndex][hourIndex] : 0;
        const diff = countA - countB;
        const intensity = getIntensity(countA);
        result.push({
          day: dayIndex,
          hour: hourIndex,
          count: countA,
          countB,
          diff,
          intensity,
        });
      });
    });
    return result;
  }, [gridA, gridB]);

  const hasData = cells.some((c) => c.count > 0 || (compareMode && c.countB > 0));

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

  const exportData = cells.filter((c) => c.count > 0 || (compareMode && c.countB > 0));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 relative">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Icon name="Activity" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              {title}
              {compareMode && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Diff Heatmap (A - B)
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {compareMode
                ? `Activity difference: Green (+increase), Red (-decrease) in ${rangeALabel} vs ${rangeBLabel}`
                : 'Trip starts by day of week and hour (completed trips only)'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {trips.filter((t) => t.status === 'COMPLETED').length} Trips A
            {compareMode && ` • ${tripsB.filter((t) => t.status === 'COMPLETED').length} Trips B`}
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
                        const diff = cell?.diff || 0;
                        const intensity = cell?.intensity || 0;

                        const cellClass = compareMode
                          ? getDiffColor(diff)
                          : INTENSITY_COLORS[intensity];

                        return (
                          <div
                            key={`${dayIndex}-${hourIndex}`}
                            className={`w-10 h-10 rounded transition-all duration-150 hover:scale-110 hover:shadow-md cursor-pointer flex items-center justify-center ${cellClass}`}
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
                            {compareMode ? (
                              diff !== 0 && (
                                <span className="text-[9px] font-bold">
                                  {diff > 0 ? `+${diff}` : diff}
                                </span>
                              )
                            ) : (
                              <>
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
                              </>
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

          <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
            {compareMode ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="text-rose-600 dark:text-rose-400 font-semibold">Fewer Trips (Red)</span>
                <div className="w-5 h-3 rounded bg-rose-500" />
                <div className="w-5 h-3 rounded bg-rose-200" />
                <div className="w-5 h-3 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="w-5 h-3 rounded bg-emerald-200" />
                <div className="w-5 h-3 rounded bg-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">More Trips (Green)</span>
              </div>
            ) : (
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
            )}
            <div className="text-xs text-slate-400 dark:text-slate-500">
              {compareMode ? `Max cell diff: ±${maxDiff} trips` : `Max: ${maxCount} trips/cell`}
            </div>
          </div>

          {hoveredCell && (
            <Tooltip
              cell={hoveredCell}
              compareMode={compareMode}
              rangeALabel={rangeALabel}
              rangeBLabel={rangeBLabel}
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
        className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-colors flex items-center gap-1"
        title="Export as Excel"
      >
        <Icon name="Table" size={14} />
        <span>Excel</span>
      </button>
    </div>
  );
};

export default TripHeatmap;