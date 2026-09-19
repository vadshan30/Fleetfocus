import React, { useState, useRef, useEffect } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
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
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
    </div>
  </div>
);

const DateRangeFilter = ({ value, onChange, isLoading = false }) => {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsCustomOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyPreset = (days) => {
    const end = endOfDay(new Date());
    const start = startOfDay(subDays(new Date(), days - 1));
    const newRange = {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    };
    onChange(newRange);
    setIsCustomOpen(false);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customStart && customEnd) {
      const newRange = {
        startDate: customStart,
        endDate: customEnd,
      };
      onChange(newRange);
      setIsCustomOpen(false);
    }
  };

  const isPresetActive = (days) => {
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
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Icon name="Calendar" size={20} />
          </div>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Analytics Range
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {value.startDate && value.endDate
                ? `${format(new Date(value.startDate), 'MMM d, yyyy')} – ${format(new Date(value.endDate), 'MMM d, yyyy')}`
                : 'Select a date range'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => applyPreset(preset.days)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                isPresetActive(preset.days)
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

          {isCustomOpen && (
            <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 w-full sm:w-auto">
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
      </div>
    </div>
  );
};

export default DateRangeFilter;