import React, { useState, useRef, useEffect, useMemo } from 'react';
import { format, subDays, subMonths, subYears, parseISO, startOfDay, endOfDay, differenceInDays } from 'date-fns';
import Icon from '../ui/Icon';

const PRESETS = [
  { key: '7d', label: 'Last 7 days', days: 7 },
  { key: '30d', label: 'Last 30 days', days: 30 },
  { key: '90d', label: 'Last 90 days', days: 90 },
];

const SkeletonDateRangeFilter = () => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm animate-pulse">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="space-y-1">
          <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-2 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
    </div>
  </div>
);

export const calculatePrecedingRange = (rangeA) => {
  if (!rangeA?.startDate || !rangeA?.endDate) {
    const end = endOfDay(new Date());
    const start = startOfDay(subDays(end, 29));
    rangeA = { startDate: format(start, 'yyyy-MM-dd'), endDate: format(end, 'yyyy-MM-dd') };
  }
  const startA = parseISO(rangeA.startDate);
  const endA = parseISO(rangeA.endDate);
  const days = Math.max(1, differenceInDays(endA, startA) + 1);

  const endB = subDays(startA, 1);
  const startB = subDays(endB, days - 1);

  return {
    startDate: format(startB, 'yyyy-MM-dd'),
    endDate: format(endB, 'yyyy-MM-dd'),
  };
};

const DateRangeFilter = ({
  value,
  onChange,
  isLoading = false,
  compareMode = false,
  onCompareModeChange,
  rangeB,
  onRangeBChange,
  onCompareChange,
}) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [isCustomOpenB, setIsCustomOpenB] = useState(false);
  const [customStartB, setCustomStartB] = useState('');
  const [customEndB, setCustomEndB] = useState('');

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsCustomOpen(false);
        setIsCustomOpenB(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const effectiveRangeB = useMemo(() => {
    if (rangeB && rangeB.startDate && rangeB.endDate) {
      return rangeB;
    }
    return calculatePrecedingRange(value);
  }, [rangeB, value]);

  const handleToggleCompare = () => {
    const nextMode = !compareMode;
    if (onCompareModeChange) {
      onCompareModeChange(nextMode);
    }
    const targetRangeB = effectiveRangeB;
    if (nextMode && onRangeBChange && (!rangeB || !rangeB.startDate)) {
      onRangeBChange(targetRangeB);
    }
    if (onCompareChange) {
      onCompareChange({
        rangeA: value,
        rangeB: targetRangeB,
        compareMode: nextMode,
      });
    }
  };

  const applyPresetA = (days) => {
    const end = endOfDay(new Date());
    const start = startOfDay(subDays(new Date(), days - 1));
    const newRangeA = {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    };
    onChange(newRangeA);
    setIsCustomOpen(false);

    if (compareMode) {
      const newRangeB = calculatePrecedingRange(newRangeA);
      if (onRangeBChange) onRangeBChange(newRangeB);
      if (onCompareChange) {
        onCompareChange({ rangeA: newRangeA, rangeB: newRangeB, compareMode: true });
      }
    }
  };

  const handleCustomSubmitA = (e) => {
    e.preventDefault();
    if (customStart && customEnd) {
      const newRangeA = {
        startDate: customStart,
        endDate: customEnd,
      };
      onChange(newRangeA);
      setIsCustomOpen(false);

      if (compareMode) {
        const newRangeB = calculatePrecedingRange(newRangeA);
        if (onRangeBChange) onRangeBChange(newRangeB);
        if (onCompareChange) {
          onCompareChange({ rangeA: newRangeA, rangeB: newRangeB, compareMode: true });
        }
      }
    }
  };

  const applyPresetB = (type) => {
    if (!value?.startDate || !value?.endDate) return;
    const startA = parseISO(value.startDate);
    const endA = parseISO(value.endDate);
    const days = Math.max(1, differenceInDays(endA, startA) + 1);

    let newB;
    if (type === 'preceding') {
      const endB = subDays(startA, 1);
      const startB = subDays(endB, days - 1);
      newB = { startDate: format(startB, 'yyyy-MM-dd'), endDate: format(endB, 'yyyy-MM-dd') };
    } else if (type === 'lastMonth') {
      const startB = subMonths(startA, 1);
      const endB = subMonths(endA, 1);
      newB = { startDate: format(startB, 'yyyy-MM-dd'), endDate: format(endB, 'yyyy-MM-dd') };
    } else if (type === 'lastYear') {
      const startB = subYears(startA, 1);
      const endB = subYears(endA, 1);
      newB = { startDate: format(startB, 'yyyy-MM-dd'), endDate: format(endB, 'yyyy-MM-dd') };
    }

    if (newB) {
      if (onRangeBChange) onRangeBChange(newB);
      if (onCompareChange) {
        onCompareChange({ rangeA: value, rangeB: newB, compareMode: true });
      }
      setIsCustomOpenB(false);
    }
  };

  const handleCustomSubmitB = (e) => {
    e.preventDefault();
    if (customStartB && customEndB) {
      const newB = { startDate: customStartB, endDate: customEndB };
      if (onRangeBChange) onRangeBChange(newB);
      if (onCompareChange) {
        onCompareChange({ rangeA: value, rangeB: newB, compareMode: true });
      }
      setIsCustomOpenB(false);
    }
  };

  const isPresetActiveA = (days) => {
    if (!value.startDate || !value.endDate) return false;
    const diff = Math.ceil((new Date(value.endDate) - new Date(value.startDate)) / (1000 * 60 * 60 * 24)) + 1;
    return diff === days;
  };

  if (isLoading) {
    return <SkeletonDateRangeFilter />;
  }

  return (
    <div
      ref={dropdownRef}
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-all"
    >
      {/* Top Header / Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Icon name="Calendar" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Analytics Timeframe
              </span>
              {compareMode && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Comparison Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {value.startDate && value.endDate
                ? `${format(new Date(value.startDate), 'MMM d, yyyy')} – ${format(new Date(value.endDate), 'MMM d, yyyy')}`
                : 'Select a date range'}
              {compareMode && effectiveRangeB?.startDate && (
                <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                  {' '}vs {format(new Date(effectiveRangeB.startDate), 'MMM d, yyyy')} – {format(new Date(effectiveRangeB.endDate), 'MMM d, yyyy')}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleToggleCompare}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 shadow-xs ${
              compareMode
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-500/20'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            <Icon name="BarChart2" size={14} />
            <span>{compareMode ? 'Comparing Range B' : 'Compare Period'}</span>
          </button>
        </div>
      </div>

      {/* Range A Selectors */}
      <div className={`mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2`}>
        <div className="flex items-center gap-2">
          {compareMode && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 w-16">
              Range A:
            </span>
          )}
          {PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => applyPresetA(preset.days)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isPresetActiveA(preset.days)
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {preset.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setIsCustomOpen(!isCustomOpen)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1 ${
              isCustomOpen
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Icon name="Calendar" size={14} />
            <span>Custom</span>
            <Icon name={isCustomOpen ? 'ChevronUp' : 'ChevronDown'} size={12} />
          </button>
        </div>

        {isCustomOpen && (
          <form onSubmit={handleCustomSubmitA} className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <label htmlFor="custom-start" className="sr-only">Start date</label>
            <input
              id="custom-start"
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              max={value.endDate || format(new Date(), 'yyyy-MM-dd')}
              className="px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <span className="text-slate-400 dark:text-slate-500">to</span>
            <label htmlFor="custom-end" className="sr-only">End date</label>
            <input
              id="custom-end"
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              min={customStart}
              max={format(new Date(), 'yyyy-MM-dd')}
              className="px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => {
                setCustomStart('');
                setCustomEnd('');
                setIsCustomOpen(false);
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              Cancel
            </button>
          </form>
        )}
      </div>

      {/* Range B Row (shown only when compareMode is ON) */}
      {compareMode && (
        <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-950/60 flex flex-wrap items-center justify-between gap-2 bg-indigo-50/40 dark:bg-indigo-950/20 -mx-4 -mb-4 p-4 rounded-b-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 w-16">
              Range B:
            </span>
            <button
              type="button"
              onClick={() => applyPresetB('preceding')}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all"
            >
              Preceding Period
            </button>
            <button
              type="button"
              onClick={() => applyPresetB('lastMonth')}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all"
            >
              Previous Month
            </button>
            <button
              type="button"
              onClick={() => applyPresetB('lastYear')}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all"
            >
              Same Period Last Year
            </button>
            <button
              type="button"
              onClick={() => setIsCustomOpenB(!isCustomOpenB)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1 border ${
                isCustomOpenB
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Icon name="Calendar" size={14} />
              <span>Custom B</span>
              <Icon name={isCustomOpenB ? 'ChevronUp' : 'ChevronDown'} size={12} />
            </button>
          </div>

          {isCustomOpenB && (
            <form onSubmit={handleCustomSubmitB} className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
              <label htmlFor="custom-b-start" className="sr-only">Start date B</label>
              <input
                id="custom-b-start"
                type="date"
                value={customStartB}
                onChange={(e) => setCustomStartB(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <span className="text-slate-400 dark:text-slate-500">to</span>
              <label htmlFor="custom-b-end" className="sr-only">End date B</label>
              <input
                id="custom-b-end"
                type="date"
                value={customEndB}
                onChange={(e) => setCustomEndB(e.target.value)}
                min={customStartB}
                className="px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomStartB('');
                  setCustomEndB('');
                  setIsCustomOpenB(false);
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;