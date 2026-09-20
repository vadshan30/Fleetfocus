import React from 'react';
import Icon from '../ui/Icon';

const AlertStatsCards = ({ stats = {} }) => {
  const cards = [
    {
      label: 'Total Alerts',
      value: stats.total ?? 0,
      icon: 'Bell',
      color: 'slate',
      bgLight: 'bg-slate-100 text-slate-700',
      bgDark: 'dark:bg-slate-800 dark:text-slate-300',
      badge: 'All recorded',
    },
    {
      label: 'Critical',
      value: stats.critical ?? 0,
      icon: 'AlertTriangle',
      color: 'rose',
      bgLight: 'bg-rose-50 text-rose-600',
      bgDark: 'dark:bg-rose-950/50 dark:text-rose-400',
      badge: 'Immediate action',
    },
    {
      label: 'Warning',
      value: stats.warning ?? 0,
      icon: 'AlertCircle',
      color: 'amber',
      bgLight: 'bg-amber-50 text-amber-600',
      bgDark: 'dark:bg-amber-950/50 dark:text-amber-400',
      badge: 'Attention required',
    },
    {
      label: 'Unacknowledged',
      value: stats.unacknowledged ?? 0,
      icon: 'Clock',
      color: 'blue',
      bgLight: 'bg-blue-50 text-blue-600',
      bgDark: 'dark:bg-blue-950/50 dark:text-blue-400',
      badge: 'Needs review',
    },
    {
      label: 'Resolved',
      value: stats.resolved ?? 0,
      icon: 'CheckCircle2',
      color: 'emerald',
      bgLight: 'bg-emerald-50 text-emerald-600',
      bgDark: 'dark:bg-emerald-950/50 dark:text-emerald-400',
      badge: 'Closed out',
    },
    {
      label: 'Last 24 Hours',
      value: stats.last24h ?? 0,
      icon: 'Activity',
      color: 'purple',
      bgLight: 'bg-purple-50 text-purple-600',
      bgDark: 'dark:bg-purple-950/50 dark:text-purple-400',
      badge: 'Recent spike',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {card.label}
            </span>
            <div className={`p-2 rounded-lg ${card.bgLight} ${card.bgDark}`}>
              <Icon name={card.icon} size={16} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {Number(card.value).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {card.badge}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertStatsCards;
