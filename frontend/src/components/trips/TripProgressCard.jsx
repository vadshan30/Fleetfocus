import React from 'react';
import Icon from '../ui/Icon';
import StatusBadge from '../ui/StatusBadge';

const TripProgressCard = ({ trip, remainingKm, onEndTrip, onCancelTrip }) => {
  if (!trip) return null;

  const originName = trip.originLat && trip.originLng
    ? `${trip.originLat.toFixed(3)}, ${trip.originLng.toFixed(3)}`
    : 'Origin Point';

  const destinationName = trip.destinationLat && trip.destinationLng
    ? `${trip.destinationLat.toFixed(3)}, ${trip.destinationLng.toFixed(3)}`
    : 'Destination Point';

  const distanceCovered = trip.distanceCovered || 0;
  const currentRemaining = typeof remainingKm === 'number'
    ? remainingKm
    : (trip.remainingKm != null ? trip.remainingKm : null);

  let progressPercent = 0;
  if (currentRemaining != null && (distanceCovered + currentRemaining) > 0) {
    progressPercent = Math.min(100, Math.max(0, Math.round((distanceCovered / (distanceCovered + currentRemaining)) * 100)));
  } else if (trip.status === 'COMPLETED') {
    progressPercent = 100;
  } else if (trip.status === 'IN_PROGRESS') {
    progressPercent = distanceCovered > 0 ? 50 : 15;
  }

  const formatEta = (isoString) => {
    if (!isoString) return null;
    try {
      const date = new Date(isoString);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const diffMs = date.getTime() - Date.now();
      const diffMin = Math.max(0, Math.round(diffMs / 60000));
      return { timeStr, diffMin };
    } catch {
      return null;
    }
  };

  const etaInfo = formatEta(trip.estimatedArrivalTime);
  const isDelayed = trip.delayMinutes != null && trip.delayMinutes > 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col gap-5">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 font-mono font-bold text-sm">
            #{trip.id}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {trip.vehicle?.licensePlate || 'Fleet Vehicle'}
              </h4>
              <StatusBadge status={trip.status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Driver: {trip.driver?.user?.username || 'Unassigned'} • {trip.vehicle?.model || 'Commercial'}
            </p>
          </div>
        </div>

        {/* Delay Indicator */}
        {isDelayed && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs font-semibold animate-pulse">
            <Icon name="AlertTriangle" size={14} />
            <span>Delayed ~{trip.delayMinutes} min</span>
          </div>
        )}
      </div>

      {/* Origin -> Destination Route Visualizer */}
      <div className="relative py-2 px-3 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950/60 shrink-0" />
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Origin</span>
              <span className="truncate max-w-[140px] block font-semibold">{originName}</span>
            </div>
          </div>

          <div className="flex-1 mx-4 flex items-center justify-center">
            <div className="w-full h-0.5 bg-slate-200 dark:bg-slate-700 relative">
              <div
                className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 shadow flex items-center justify-center"
                style={{ left: `${progressPercent}%` }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-right">
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">Destination</span>
              <span className="truncate max-w-[140px] block font-semibold">{destinationName}</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-100 dark:ring-rose-950/60 shrink-0" />
          </div>
        </div>
      </div>

      {/* Progress & Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
            <Icon name="Navigation" size={12} className="text-blue-500" />
            <span>Covered</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {distanceCovered.toFixed(1)} km
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
            <Icon name="MapPin" size={12} className="text-purple-500" />
            <span>Remaining</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {currentRemaining != null ? `${currentRemaining.toFixed(1)} km` : '—'}
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/60 col-span-2 sm:col-span-2">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
            <Icon name="Clock" size={12} className="text-emerald-500" />
            <span>Live ETA</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {etaInfo ? (
              <>
                <span className="text-emerald-600 dark:text-emerald-400">{etaInfo.timeStr}</span>
                <span className="text-xs font-normal text-slate-500">(~{etaInfo.diffMin} min)</span>
              </>
            ) : trip.status === 'COMPLETED' ? (
              <span className="text-slate-400 font-normal">Arrived</span>
            ) : (
              <span className="text-slate-400 font-normal">Calculating...</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons if provided */}
      {(onEndTrip || onCancelTrip) && (trip.status === 'IN_PROGRESS' || trip.status === 'SCHEDULED') && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {onEndTrip && trip.status === 'IN_PROGRESS' && (
            <button
              onClick={() => onEndTrip(trip.id)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Icon name="CheckCircle2" size={14} />
              <span>Complete Trip</span>
            </button>
          )}
          {onCancelTrip && (
            <button
              onClick={() => onCancelTrip(trip.id)}
              className="px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Icon name="XCircle" size={14} />
              <span>Cancel Trip</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TripProgressCard;
