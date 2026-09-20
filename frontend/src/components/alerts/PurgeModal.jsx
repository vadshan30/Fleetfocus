import React, { useState } from 'react';
import Icon from '../ui/Icon';

const PurgeModal = ({ isOpen, onClose, onConfirm, loading = false }) => {
  const [days, setDays] = useState(30);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6">
        <div className="flex items-start gap-3.5 mb-4">
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
            <Icon name="Trash2" size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
              Purge Old Resolved Alerts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Permanently delete closed alerts to free up database storage and improve query performance.
            </p>
          </div>
        </div>

        <div className="space-y-4 my-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Select Retention Threshold
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[7, 30, 90].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setDays(opt)}
                  className={`py-2.5 px-3 text-xs font-medium rounded-xl border transition-all ${
                    days === opt
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 shadow-sm font-semibold'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  Older than {opt} days
                </button>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs leading-relaxed flex items-start gap-2">
            <Icon name="AlertTriangle" size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>
              <strong>Note:</strong> Only <em>resolved</em> alerts created prior to the cutoff will be deleted. Unacknowledged or active alerts are never purged.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(days)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-sm shadow-rose-500/20 transition-all disabled:opacity-50"
          >
            <Icon name="Trash2" size={14} />
            <span>{loading ? 'Purging...' : `Purge Resolved (> ${days}d)`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurgeModal;
