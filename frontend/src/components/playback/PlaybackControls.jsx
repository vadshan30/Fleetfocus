import React from 'react';
import Icon from '../ui/Icon';

const PlaybackControls = ({
  isPlaying,
  onTogglePlay,
  speed,
  onChangeSpeed,
  currentTime,
  onReset,
  vehicles = [],
  selectedVehicleId,
  onSelectVehicle,
  showTrails,
  onToggleTrails,
}) => {
  const speeds = [1, 10, 60];

  const formatTimestamp = (date) => {
    if (!date || isNaN(date.getTime())) return '--:--:--';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-lg flex flex-col gap-3 text-slate-800 dark:text-slate-100 max-w-full">
      {/* Top row: Play/Pause, Speed, Reset, Time display */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Playback action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className={`flex items-center justify-center w-10 h-10 rounded-lg font-semibold transition-all ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
            }`}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <Icon name={isPlaying ? 'Pause' : 'Play'} size={20} />
          </button>

          <button
            onClick={onReset}
            className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            title="Reset to Start"
          >
            <Icon name="RotateCcw" size={18} />
          </button>

          {/* Speed selector pills */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  speed === s
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Current Timestamp & Trail Toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs cursor-pointer select-none font-medium text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showTrails}
              onChange={(e) => onToggleTrails(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span>Show trails</span>
          </label>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-mono font-bold tracking-wider text-slate-900 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{formatTimestamp(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* Bottom row: Vehicle filter chips */}
      {vehicles.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">Vehicles:</span>
          <button
            onClick={() => onSelectVehicle(null)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              selectedVehicleId === null
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            All ({vehicles.length})
          </button>
          {vehicles.map((v) => (
            <button
              key={v.id || v.vehicleId}
              onClick={() => onSelectVehicle(v.id || v.vehicleId)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                selectedVehicleId === (v.id || v.vehicleId)
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {v.licensePlate}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaybackControls;
