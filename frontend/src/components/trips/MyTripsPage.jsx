import React, { useState, useEffect, useCallback } from 'react';
import tripService from '../../services/tripService';
import StatCard from '../ui/StatCard';
import StatusBadge from '../ui/StatusBadge';
import Icon from '../ui/Icon';
import ErrorState from '../common/ErrorState';

const MyTripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchMyTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tripService.getMyTrips();
      const tripsList = Array.isArray(data) ? data : data?.content || [];
      setTrips(tripsList);
    } catch (err) {
      console.error('Failed to fetch driver trips:', err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load your assigned trips. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyTrips();
  }, [fetchMyTrips]);

  const inProgressTrips = trips.filter((t) => t.status === 'IN_PROGRESS');
  const scheduledTrips = trips.filter((t) => t.status === 'SCHEDULED');
  const completedTrips = trips.filter((t) => t.status === 'COMPLETED');
  const totalDistance = completedTrips.reduce((acc, t) => acc + (t.distanceCovered || 0), 0);

  const filteredTrips = trips.filter((trip) => {
    const matchesFilter = filter === 'ALL' || trip.status === filter;
    const matchesSearch =
      !search ||
      trip.vehicle?.licensePlate?.toLowerCase().includes(search.toLowerCase()) ||
      trip.vehicle?.model?.toLowerCase().includes(search.toLowerCase()) ||
      String(trip.id).includes(search);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              My Assigned Trips
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Icon name="Navigation" size={12} /> DRIVER
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review your historical journeys, active route progress, and scheduled dispatches.
          </p>
        </div>

        <button
          onClick={fetchMyTrips}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-all shadow-sm self-start sm:self-auto"
        >
          <Icon name="RefreshCw" size={14} className={loading ? 'animate-spin text-blue-500' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="Navigation"
          iconColor="blue"
          label="Active Journey"
          value={inProgressTrips.length}
          subtext={inProgressTrips.length > 0 ? `Trip #${inProgressTrips[0].id} in progress` : 'No active trip'}
        />
        <StatCard
          icon="Calendar"
          iconColor="purple"
          label="Scheduled"
          value={scheduledTrips.length}
          subtext="Upcoming departures booked"
        />
        <StatCard
          icon="CheckCircle2"
          iconColor="green"
          label="Completed Trips"
          value={completedTrips.length}
          subtext="Total journeys delivered"
        />
        <StatCard
          icon="MapPin"
          iconColor="amber"
          label="Total Distance"
          value={`${totalDistance.toFixed(0)} km`}
          subtext="Cumulative logged distance"
        />
      </div>

      {/* ERROR STATE */}
      {error && !loading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <ErrorState message={error} onRetry={fetchMyTrips} />
        </div>
      )}

      {/* TRIPS TABLE & FILTERS */}
      {!error && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            {/* TABS */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'ALL', label: 'All Trips', count: trips.length },
                { id: 'IN_PROGRESS', label: 'In Progress', count: inProgressTrips.length },
                { id: 'SCHEDULED', label: 'Scheduled', count: scheduledTrips.length },
                { id: 'COMPLETED', label: 'Completed', count: completedTrips.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    filter === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* SEARCH */}
            <div className="relative w-full sm:w-64">
              <Icon
                name="Search"
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Filter by plate, model, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <Icon name="RefreshCw" size={24} className="animate-spin text-blue-500" />
              <span>Loading assigned journeys...</span>
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs space-y-2">
              <Icon name="Navigation" size={32} className="mx-auto text-slate-300 dark:text-slate-700" />
              <div className="font-semibold text-slate-600 dark:text-slate-300">
                No assigned trips found
              </div>
              <div className="text-[11px] text-slate-400">
                {search ? 'Try adjusting your search filter.' : 'When a dispatcher assigns a trip to you, it will appear here.'}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-3">Trip ID</th>
                    <th className="py-3 px-3">Assigned Vehicle</th>
                    <th className="py-3 px-3">Start Time</th>
                    <th className="py-3 px-3">End Time</th>
                    <th className="py-3 px-3">Distance</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredTrips.map((trip) => (
                    <tr
                      key={trip.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900 dark:text-slate-100">
                        #{trip.id}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                          {trip.vehicle?.licensePlate || 'N/A'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {trip.vehicle?.model || 'Fleet Vehicle'}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                        {trip.startTime ? new Date(trip.startTime).toLocaleString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                        {trip.endTime ? new Date(trip.endTime).toLocaleString() : '—'}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                        {trip.distanceCovered ? `${trip.distanceCovered.toFixed(1)} km` : '—'}
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={trip.status} pulse={trip.status === 'IN_PROGRESS'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyTripsPage;
