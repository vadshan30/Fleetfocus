import React, { useState } from 'react';
import Icon from '../ui/Icon';
import StatusBadge from '../ui/StatusBadge';
import tripService from '../../services/tripService';

const ActiveTripCard = ({ trip, eta, onTripUpdate, onReportIssueClick }) => {
  const [loadingAction, setLoadingAction] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [endDistance, setEndDistance] = useState('');
  const [actionError, setActionError] = useState(null);

  if (!trip) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-center py-10 space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
          <Icon name="Navigation" size={26} />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
            No Active Trip
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            You are currently on standby. Waiting for dispatch to assign your next journey.
          </p>
        </div>
      </div>
    );
  }

  const isScheduled = trip.status === 'SCHEDULED';
  const isInProgress = trip.status === 'IN_PROGRESS';

  const handleStartTrip = async () => {
    setLoadingAction(true);
    setActionError(null);
    try {
      const updated = await tripService.startByDriver(trip.id);
      if (typeof window !== 'undefined' && window.addNotification) {
        window.addNotification(`Trip #${trip.id} started. Safe driving!`, 'success');
      }
      onTripUpdate?.(updated);
    } catch (err) {
      console.error('Failed to start trip:', err);
      setActionError(err?.response?.data?.message || err?.message || 'Failed to start trip.');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleConfirmEndTrip = async () => {
    setLoadingAction(true);
    setActionError(null);
    try {
      const dist = endDistance ? parseFloat(endDistance) : (trip.distanceCovered || 0);
      const updated = await tripService.endByDriver(trip.id, dist);
      if (typeof window !== 'undefined' && window.addNotification) {
        window.addNotification(`Trip #${trip.id} completed. Vehicle freed.`, 'success');
      }
      setShowEndModal(false);
      onTripUpdate?.(updated);
    } catch (err) {
      console.error('Failed to end trip:', err);
      setActionError(err?.response?.data?.message || err?.message || 'Failed to end trip.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Remaining km and ETA display
  const remainingKm = eta?.remainingKm;
  const delayMinutes = eta?.delayMinutes || trip.delayMinutes || 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
      {/* Top Banner with Trip ID and Status */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            #{trip.id}
          </div>
          <div>
            <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Active Journey</div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {trip.vehicle?.licensePlate} ({trip.vehicle?.model})
            </div>
          </div>
        </div>
        <StatusBadge status={trip.status} pulse={isInProgress} />
      </div>

      {actionError && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <Icon name="AlertCircle" size={16} className="shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Origin -> Destination Route Details */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950" />
            <span className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-4 ring-rose-100 dark:ring-rose-950" />
          </div>

          <div className="flex-1 space-y-2 text-xs">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Origin</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {trip.originLat != null && trip.originLng != null
                  ? `${trip.originLat.toFixed(4)}, ${trip.originLng.toFixed(4)}`
                  : 'Assigned Depot / Origin'}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Destination</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                {trip.destinationLat != null && trip.destinationLng != null
                  ? `${trip.destinationLat.toFixed(4)}, ${trip.destinationLng.toFixed(4)}`
                  : 'Delivery Endpoint'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live ETA Card if In Progress */}
      {isInProgress && (
        <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold">
              <Icon name="Clock" size={16} />
              <span>
                {eta?.estimatedArrivalTime ? (
                  `ETA: ${new Date(eta.estimatedArrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                ) : (
                  'Calculating ETA live...'
                )}
              </span>
            </div>
            {remainingKm != null && (
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {remainingKm.toFixed(1)} km left
              </span>
            )}
          </div>

          {delayMinutes > 0 && (
            <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5">
              <Icon name="AlertTriangle" size={13} />
              <span>Delay detected: +{delayMinutes} min</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons: Min touch target h-12 (48px) */}
      <div className="pt-2 space-y-2.5">
        {isScheduled && (
          <button
            onClick={handleStartTrip}
            disabled={loadingAction}
            className="w-full h-12 min-h-[48px] rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            {loadingAction ? (
              <Icon name="RefreshCw" size={20} className="animate-spin" />
            ) : (
              <>
                <Icon name="Play" size={18} />
                <span>Start Trip</span>
              </>
            )}
          </button>
        )}

        {isInProgress && (
          <div className="flex gap-2.5">
            <button
              onClick={() => {
                setEndDistance(trip.distanceCovered ? String(trip.distanceCovered) : '');
                setShowEndModal(true);
              }}
              disabled={loadingAction}
              className="flex-1 h-12 min-h-[48px] rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              <Icon name="Square" size={18} />
              <span>End Trip</span>
            </button>

            <button
              onClick={onReportIssueClick}
              className="h-12 min-h-[48px] px-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Icon name="AlertTriangle" size={16} />
              <span>Report Issue</span>
            </button>
          </div>
        )}
      </div>

      {/* End Trip Modal Confirmation */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Icon name="Flag" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Complete Active Trip?
                </h4>
                <p className="text-xs text-slate-500">Trip #{trip.id} will be finalized.</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Total Distance Driven (km)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={endDistance}
                onChange={(e) => setEndDistance(e.target.value)}
                placeholder="e.g. 24.5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400">
                Recorded so far: {trip.distanceCovered ? trip.distanceCovered.toFixed(1) : '0.0'} km
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEndTrip}
                disabled={loadingAction}
                className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5"
              >
                {loadingAction ? (
                  <Icon name="RefreshCw" size={16} className="animate-spin" />
                ) : (
                  <span>Confirm End</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveTripCard;
