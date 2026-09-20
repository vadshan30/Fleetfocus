import React from 'react';
import Icon from '../ui/Icon';

const BulkActionBar = ({
  selectedCount,
  onAcknowledgeSelected,
  onResolveSelected,
  onClearSelection,
  loading = false,
}) => {
  if (!selectedCount) return null;

  return (
    <div className="sticky top-4 z-20 mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="bg-slate-900 dark:bg-slate-950 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white shadow-sm">
            {selectedCount}
          </span>
          <span className="text-xs font-semibold tracking-wide">
            {selectedCount} {selectedCount === 1 ? 'alert' : 'alerts'} selected
          </span>
          <button
            onClick={onClearSelection}
            className="text-xs text-slate-400 hover:text-white underline decoration-slate-600 hover:decoration-white transition-colors"
          >
            Clear selection
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAcknowledgeSelected}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            <Icon name="Check" size={13} />
            <span>Acknowledge Selected</span>
          </button>

          <button
            onClick={onResolveSelected}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            <Icon name="CheckCircle2" size={13} />
            <span>Resolve Selected</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionBar;
