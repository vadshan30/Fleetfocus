import React, { useState, useEffect } from 'react';
import monitoringService from '../../services/monitoringService';

// UI Components
import StatCard from '../ui/StatCard';
import StatusBadge from '../ui/StatusBadge';
import DataTable from '../ui/DataTable';
import Icon from '../ui/Icon';
import SkeletonLoader from '../common/SkeletonLoader';

const LiveFleet = () => {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchLiveFleet = async () => {
    try {
      const data = await monitoringService.getLiveFleet();
      setFleet(data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching live fleet:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLiveFleet();
    const interval = setInterval(fetchLiveFleet, 5000);
    return () => clearInterval(interval);
  }, []);

  const total = fleet.length;
  const onTrip = fleet.filter((v) => v.status === 'ON_TRIP').length;
  const available = fleet.filter((v) => v.status === 'AVAILABLE').length;
  const maintenance = fleet.filter((v) => v.status === 'UNDER_MAINTENANCE' || v.status === 'MAINTENANCE').length;

  const filteredFleet = fleet.filter((v) => {
    const matchesTab =
      activeTab === 'ALL' ||
      (activeTab === 'ON_TRIP' && v.status === 'ON_TRIP') ||
      (activeTab === 'AVAILABLE' && v.status === 'AVAILABLE') ||
      (activeTab === 'MAINTENANCE' && (v.status === 'UNDER_MAINTENANCE' || v.status === 'MAINTENANCE'));

    const matchesSearch =
      !searchTerm ||
      v.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.status?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const tabs = [
    { id: 'ALL', label: 'All Fleet', count: total },
    { id: 'ON_TRIP', label: 'On Trip', count: onTrip },
    { id: 'AVAILABLE', label: 'Available', count: available },
    { id: 'MAINTENANCE', label: 'Maintenance', count: maintenance },
  ];

  const columns = [
    {
      header: 'Vehicle',
      accessor: 'licensePlate',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Icon name="Truck" size={18} />
          </div>
          <div>
            <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
              {row.licensePlate || 'N/A'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {row.model || 'Fleet Vehicle'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} pulse={row.status === 'ON_TRIP'} />,
    },
    {
      header: 'Current Speed',
      accessor: 'speed',
      render: (row) => {
        const speed = row.speed || 0;
        const isHighSpeed = speed > 100;
        return (
          <div className="flex items-center gap-2">
            <Icon name="Gauge" size={16} className={isHighSpeed ? 'text-rose-500' : 'text-slate-400'} />
            <span
              className={`font-semibold text-xs ${
                isHighSpeed ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {speed.toFixed(1)} km/h
            </span>
            {isHighSpeed && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                Speeding
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Fuel Level',
      accessor: 'fuelLevel',
      render: (row) => {
        const fuel = Math.min(100, Math.max(0, row.fuelLevel || 0));
        const fuelColor =
          fuel >= 60 ? 'bg-emerald-500' : fuel >= 30 ? 'bg-amber-500' : 'bg-rose-500';

        return (
          <div className="w-48">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px]">
                <Icon name="Fuel" size={13} /> Fuel
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                {fuel.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${fuelColor}`}
                style={{ width: `${fuel}%` }}
              />
            </div>
          </div>
        );
      },
    },
  ];

  if (loading && fleet.length === 0) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <SkeletonLoader type="title" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonLoader type="stat" count={4} />
        </div>
        <SkeletonLoader type="table-row" count={5} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Live Fleet Monitoring
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time telemetry, GPS status, speed monitoring, and fuel levels.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-sm">
          <Icon name="RefreshCw" size={14} className="animate-spin text-blue-500" />
          <span>Auto-refreshing · {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="Truck"
          iconColor="blue"
          label="Total Fleet"
          value={total}
          subtext="Monitored active telemetry"
        />
        <StatCard
          icon="Navigation"
          iconColor="amber"
          label="On Trip"
          value={onTrip}
          subtext="Active telemetry streaming"
          progress={{ percent: Math.round((onTrip / (total || 1)) * 100), color: 'amber' }}
        />
        <StatCard
          icon="CheckCircle2"
          iconColor="green"
          label="Available"
          value={available}
          subtext="Stationary & available"
          progress={{ percent: Math.round((available / (total || 1)) * 100), color: 'green' }}
        />
        <StatCard
          icon="Wrench"
          iconColor="red"
          label="Maintenance"
          value={maintenance}
          subtext="In service workshop"
          progress={{ percent: Math.round((maintenance / (total || 1)) * 100), color: 'red' }}
        />
      </div>

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={filteredFleet}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Filter live vehicles by license plate or model..."
        isLoading={loading}
        emptyMessage={searchTerm ? 'No live vehicles match search' : 'No vehicles in fleet'}
        emptySubtext={searchTerm ? 'Try adjusting your search query.' : 'Register vehicles to view live monitoring data.'}
      />
    </div>
  );
};

export default LiveFleet;