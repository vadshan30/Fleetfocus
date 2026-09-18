import React from 'react';
import Icon from './Icon';

const statusConfigs = {
  AVAILABLE: {
    label: 'Available',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200/80 dark:border-emerald-800/60',
    dotColor: 'bg-emerald-500',
    icon: null,
  },
  ACTIVE: {
    label: 'Active',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200/80 dark:border-emerald-800/60',
    dotColor: 'bg-emerald-500',
    icon: null,
  },
  COMPLETED: {
    label: 'Completed',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200/80 dark:border-emerald-800/60',
    dotColor: 'bg-emerald-500',
    icon: 'CheckCircle2',
  },
  PASS: {
    label: 'Pass',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/50',
    textColor: 'text-emerald-700 dark:text-emerald-300',
    borderColor: 'border-emerald-200/80 dark:border-emerald-800/60',
    dotColor: 'bg-emerald-500',
    icon: 'Check',
  },
  VERIFIED: {
    label: 'Verified',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200/80 dark:border-blue-800/60',
    dotColor: 'bg-blue-500',
    icon: 'ShieldCheck',
  },
  ON_TRIP: {
    label: 'On Trip',
    bgColor: 'bg-amber-50 dark:bg-amber-950/50',
    textColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-200/80 dark:border-amber-800/60',
    dotColor: 'bg-amber-500',
    pulse: true,
    icon: null,
  },
  IN_PROGRESS: {
    label: 'In Progress',
    bgColor: 'bg-amber-50 dark:bg-amber-950/50',
    textColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-200/80 dark:border-amber-800/60',
    dotColor: 'bg-amber-500',
    pulse: true,
    icon: null,
  },
  PENDING: {
    label: 'Pending',
    bgColor: 'bg-amber-50 dark:bg-amber-950/50',
    textColor: 'text-amber-700 dark:text-amber-300',
    borderColor: 'border-amber-200/80 dark:border-amber-800/60',
    dotColor: 'bg-amber-500',
    icon: 'Clock',
  },
  MAINTENANCE: {
    label: 'Maintenance',
    bgColor: 'bg-orange-50 dark:bg-orange-950/50',
    textColor: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-orange-200/80 dark:border-orange-800/60',
    dotColor: 'bg-orange-500',
    icon: 'Wrench',
  },
  IN_SERVICE: {
    label: 'In Service',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/50',
    textColor: 'text-indigo-700 dark:text-indigo-300',
    borderColor: 'border-indigo-200/80 dark:border-indigo-800/60',
    dotColor: 'bg-indigo-500',
    icon: 'Settings',
  },
  SCHEDULED: {
    label: 'Scheduled',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200/80 dark:border-blue-800/60',
    dotColor: 'bg-blue-500',
    icon: 'Calendar',
  },
  OFF_DUTY: {
    label: 'Off Duty',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-600 dark:text-slate-400',
    borderColor: 'border-slate-200 dark:border-slate-700',
    dotColor: 'bg-slate-400',
    icon: null,
  },
  INACTIVE: {
    label: 'Inactive',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-600 dark:text-slate-400',
    borderColor: 'border-slate-200 dark:border-slate-700',
    dotColor: 'bg-slate-400',
    icon: null,
  },
  CANCELLED: {
    label: 'Cancelled',
    bgColor: 'bg-rose-50 dark:bg-rose-950/50',
    textColor: 'text-rose-700 dark:text-rose-300',
    borderColor: 'border-rose-200/80 dark:border-rose-800/60',
    dotColor: 'bg-rose-500',
    icon: 'XCircle',
  },
  FAIL: {
    label: 'Fail',
    bgColor: 'bg-rose-50 dark:bg-rose-950/50',
    textColor: 'text-rose-700 dark:text-rose-300',
    borderColor: 'border-rose-200/80 dark:border-rose-800/60',
    dotColor: 'bg-rose-500',
    icon: 'AlertTriangle',
  },
  OUT_OF_SERVICE: {
    label: 'Out of Service',
    bgColor: 'bg-rose-50 dark:bg-rose-950/50',
    textColor: 'text-rose-700 dark:text-rose-300',
    borderColor: 'border-rose-200/80 dark:border-rose-800/60',
    dotColor: 'bg-rose-500',
    icon: 'AlertOctagon',
  },
};

const StatusBadge = ({
  status = '',
  label = null,
  showDot = true,
  pulse = false,
  className = '',
}) => {
  const normKey = (status || '').toString().toUpperCase().replace(/\s+/g, '_');
  const config = statusConfigs[normKey] || {
    label: status || 'Unknown',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-700 dark:text-slate-300',
    borderColor: 'border-slate-200 dark:border-slate-700',
    dotColor: 'bg-slate-400',
    icon: null,
  };

  const displayLabel = label || config.label;
  const isPulse = pulse || config.pulse;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} transition-colors ${className}`}
    >
      {config.icon ? (
        <Icon name={config.icon} size={12} className="shrink-0" />
      ) : showDot ? (
        <span className="relative flex h-2 w-2 shrink-0">
          {isPulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotColor}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
        </span>
      ) : null}
      <span>{displayLabel}</span>
    </span>
  );
};

export default StatusBadge;
