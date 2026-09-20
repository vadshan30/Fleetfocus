import React, { useMemo } from 'react';

const TimelineScrubber = ({
  minTime,
  maxTime,
  currentTime,
  onScrub,
  onScrubStart,
  onScrubEnd,
}) => {
  const isReady = minTime && maxTime && maxTime.getTime() > minTime.getTime();

  const sliderValue = useMemo(() => {
    if (!isReady || !currentTime) return 0;
    const total = maxTime.getTime() - minTime.getTime();
    const current = currentTime.getTime() - minTime.getTime();
    const ratio = Math.max(0, Math.min(1, current / total));
    return Math.round(ratio * 1000);
  }, [isReady, minTime, maxTime, currentTime]);

  const handleChange = (e) => {
    if (!isReady) return;
    const val = Number(e.target.value);
    const total = maxTime.getTime() - minTime.getTime();
    const targetMs = minTime.getTime() + (val / 1000) * total;
    onScrub(new Date(targetMs));
  };

  const formatLabel = (date) => {
    if (!date || isNaN(date.getTime())) return '--:--';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  // Generate tick marks (up to 8 evenly spaced ticks)
  const ticks = useMemo(() => {
    if (!isReady) return [];
    const count = 6;
    const total = maxTime.getTime() - minTime.getTime();
    const list = [];
    for (let i = 0; i <= count; i++) {
      const ms = minTime.getTime() + (i / count) * total;
      const date = new Date(ms);
      list.push({
        percent: (i / count) * 100,
        label: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      });
    }
    return list;
  }, [isReady, minTime, maxTime]);

  if (!isReady) return null;

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-lg flex flex-col gap-2 text-slate-800 dark:text-slate-100">
      {/* Time Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
        <span>{formatLabel(minTime)}</span>
        <div className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-mono text-xs border border-blue-200/50 dark:border-blue-900/50">
          {formatLabel(currentTime)}
        </div>
        <span>{formatLabel(maxTime)}</span>
      </div>

      {/* Slider Track */}
      <div className="relative flex flex-col py-1">
        <input
          type="range"
          min="0"
          max="1000"
          value={sliderValue}
          onChange={handleChange}
          onMouseDown={onScrubStart}
          onMouseUp={onScrubEnd}
          onTouchStart={onScrubStart}
          onTouchEnd={onScrubEnd}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
        />

        {/* Hour tick marks */}
        <div className="relative w-full h-4 mt-1 pointer-events-none">
          {ticks.map((tick, idx) => (
            <div
              key={idx}
              className="absolute transform -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${tick.percent}%` }}
            >
              <div className="w-0.5 h-1.5 bg-slate-300 dark:bg-slate-600 mb-0.5" />
              <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:block">
                {tick.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimelineScrubber;
