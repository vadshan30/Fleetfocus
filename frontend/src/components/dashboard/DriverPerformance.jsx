import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../ui/Icon';

const DriverPerformance = ({ trips = [], drivers = [] }) => {
  const navigate = useNavigate();

  const driverStats = drivers.map((driver) => {
    const driverTrips = trips.filter((t) => t.driver?.id === driver.id);
    const completedTrips = driverTrips.filter((t) => t.status === 'COMPLETED');
    const totalDistance = completedTrips.reduce((sum, t) => sum + (t.distanceCovered || 0), 0);
    const avgDistance = completedTrips.length > 0 ? totalDistance / completedTrips.length : 0;
    const totalTrips = driverTrips.length;

    return {
      ...driver,
      totalTrips,
      completedTrips: completedTrips.length,
      totalDistance,
      avgDistance,
      efficiency: completedTrips.length > 0 ? totalDistance / completedTrips.length : 0,
      mostRecentTrip: driverTrips.length > 0 ? driverTrips[driverTrips.length - 1] : null,
    };
  });

  const activeDrivers = driverStats.filter((d) => d.totalTrips > 0);
  const sortedByDistance = [...activeDrivers].sort((a, b) => b.totalDistance - a.totalDistance);
  const sortedByTrips = [...activeDrivers].sort((a, b) => b.totalTrips - a.totalTrips);

  const totalTripsAll = trips.filter((t) => t.status === 'COMPLETED').length;
  const totalDistanceAll = trips.reduce((sum, t) => sum + (t.distanceCovered || 0), 0);
  const avgTripDistance = totalTripsAll > 0 ? totalDistanceAll / totalTripsAll : 0;

  const stats = [
    {
      label: 'Total Distance',
      value: `${totalDistanceAll.toFixed(0)} km`,
      icon: 'MapPin',
      borderColor: 'border-l-blue-500',
      iconColor: 'text-blue-500',
      subtext: `From ${totalTripsAll} trips`,
    },
    {
      label: 'Active Drivers',
      value: activeDrivers.length,
      icon: 'Users',
      borderColor: 'border-l-emerald-500',
      iconColor: 'text-emerald-500',
      subtext: `${drivers.length} total drivers`,
    },
    {
      label: 'Avg Trip Distance',
      value: `${avgTripDistance.toFixed(1)} km`,
      icon: 'Activity',
      borderColor: 'border-l-amber-500',
      iconColor: 'text-amber-500',
      subtext: 'Per completed trip',
    },
    {
      label: 'Most Active Driver',
      value: sortedByTrips.length > 0 ? sortedByTrips[0].user?.username || 'N/A' : 'N/A',
      icon: 'Award',
      borderColor: 'border-l-purple-500',
      iconColor: 'text-purple-500',
      subtext: sortedByTrips.length > 0 ? `${sortedByTrips[0].totalTrips} trips` : 'No trips',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Icon name="Users" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">
              Driver Performance & Analytics
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {activeDrivers.length > 0
                ? `${activeDrivers.length} active driver${activeDrivers.length > 1 ? 's' : ''} with logged trips`
                : 'No driver activity recorded yet'}
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          {totalTripsAll} Completed Trips
        </span>
      </div>

      {/* Empty State */}
      {activeDrivers.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          No driver performance data available. Complete trips to generate leaderboards.
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 border-l-4 ${stat.borderColor}`}
              >
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>{stat.label}</span>
                  <Icon name={stat.icon} size={14} className={stat.iconColor} />
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-slate-50">
                  {stat.value}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{stat.subtext}</div>
              </div>
            ))}
          </div>

          {/* Leaderboards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Top Drivers by Distance */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                <Icon name="MapPin" size={13} className="text-blue-500" />
                <span>Top Drivers by Distance</span>
              </div>

              {sortedByDistance.length === 0 ? (
                <div className="text-xs text-slate-400 py-4">No data available</div>
              ) : (
                <div className="space-y-2">
                  {sortedByDistance.slice(0, 5).map((driver, i) => {
                    const medal = i === 0 ? '🏆' : i === 1 ? '🥇' : i === 2 ? '🥈' : `#${i + 1}`;
                    return (
                      <div
                        key={driver.id}
                        onClick={() => navigate('/drivers')}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 text-center text-xs font-bold text-slate-400">
                            {medal}
                          </span>
                          <div>
                            <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                              {driver.user?.username || 'Unknown Driver'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {driver.completedTrips} trips completed
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {driver.totalDistance.toFixed(0)} km
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              i === 0
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                                : i === 1
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {i === 0 ? 'BEST' : i === 1 ? 'GOOD' : 'ACTIVE'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Drivers by Trips */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                <Icon name="Route" size={13} className="text-purple-500" />
                <span>Top Drivers by Trips</span>
              </div>

              {sortedByTrips.length === 0 ? (
                <div className="text-xs text-slate-400 py-4">No data available</div>
              ) : (
                <div className="space-y-2">
                  {sortedByTrips.slice(0, 5).map((driver, i) => {
                    const medal = i === 0 ? '🏆' : i === 1 ? '🥇' : i === 2 ? '🥈' : `#${i + 1}`;
                    return (
                      <div
                        key={driver.id}
                        onClick={() => navigate('/drivers')}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-5 text-center text-xs font-bold text-slate-400">
                            {medal}
                          </span>
                          <div>
                            <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                              {driver.user?.username || 'Unknown Driver'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {driver.totalDistance.toFixed(0)} km driven
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {driver.totalTrips} trips
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              i === 0
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                                : i === 1
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {i === 0 ? 'MOST ACTIVE' : i === 1 ? 'ACTIVE' : 'REGULAR'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Footer info */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
        <span className="flex items-center gap-1">
          <Icon name="Users" size={12} /> {activeDrivers.length} active drivers
        </span>
        <span className="flex items-center gap-1">
          <Icon name="Activity" size={12} /> Avg efficiency: {avgTripDistance.toFixed(1)} km/trip
        </span>
        <span>💡 Click a driver to manage user profile</span>
      </div>
    </div>
  );
};

export default DriverPerformance;