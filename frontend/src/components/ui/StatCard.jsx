import React from 'react';
import Icon from './Icon';

const iconBgVariants = {
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
  red: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400',
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const progressVariants = {
  blue: 'bg-blue-600 dark:bg-blue-500',
  green: 'bg-emerald-600 dark:bg-emerald-500',
  amber: 'bg-amber-500 dark:bg-amber-400',
  red: 'bg-rose-600 dark:bg-rose-500',
  purple: 'bg-purple-600 dark:bg-purple-500',
  indigo: 'bg-indigo-600 dark:bg-indigo-500',
  slate: 'bg-slate-500 dark:bg-slate-400',
};

const StatCard = ({
  icon = 'Truck',
  iconColor = 'blue',
  label = 'Total Stat',
  value = '0',
  subtext = '',
  trend = null, // e.g. { value: '+12%', positive: true } or string "+12%"
  progress = null, // e.g. 75 or { percent: 75, color: 'blue' }
  className = '',
}) => {
  const iconStyle = iconBgVariants[iconColor] || iconBgVariants.blue;
  const progressPercent = typeof progress === 'number' ? progress : progress?.percent;
  const progressColorClass = progressVariants[progress?.color || iconColor] || progressVariants.blue;

  const renderTrend = () => {
    if (!trend) return null;
    const isObj = typeof trend === 'object';
    const trendVal = isObj ? trend.value : trend;
    const isPositive = isObj ? trend.positive !== false : !trendVal.startsWith('-');

    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
          isPositive
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
        }`}
      >
        <Icon name={isPositive ? 'TrendingUp' : 'TrendingDown'} size={12} />
        {trendVal}
      </span>
    );
  };

  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </span>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconStyle}`}>
            <Icon name={icon} size={18} />
          </div>
        </div>

        <div className="flex items-baseline gap-2.5 mt-1">
          <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {value}
          </span>
          {renderTrend()}
        </div>

        {subtext && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-1">
            {subtext}
          </p>
        )}
      </div>

      {progressPercent !== undefined && progressPercent !== null && (
        <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Utilization / Rate</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{progressPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColorClass}`}
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
