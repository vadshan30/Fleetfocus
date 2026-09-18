import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import tripService from '../../services/tripService';
import TripForm from './TripForm';
import ScheduleTripForm from './ScheduleTripForm';
import { exportToCSV } from '../../utils/exportUtils';

// UI Components
import StatCard from '../ui/StatCard';
import StatusBadge from '../ui/StatusBadge';
import DataTable from '../ui/DataTable';
import Icon from '../ui/Icon';
import SkeletonLoader from '../common/SkeletonLoader';

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const user = useSelector((state) => state.auth.user);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await tripService.getAll();
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const handleEndTrip = async (id) => {
    const trip = trips.find((t) => t.id === id);
    if (!trip) return;

    if (trip.status === 'COMPLETED') {
      if (window.addNotification) {
        window.addNotification('Trip is already completed!', 'warning');
      }
      return;
    }

    if (trip.status === 'CANCELLED') {
      if (window.addNotification) {
        window.addNotification('Cannot end a cancelled trip!', 'warning');
      }
      return;
    }

    const distance = prompt('Enter distance covered (km):', '0');
    if (distance === null) return;

    try {
      await tripService.end(id, parseFloat(distance));
      if (window.addNotification) {
        window.addNotification('Trip ended successfully!', 'success');
      }
      fetchTrips();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Error ending trip!';
      if (window.addNotification) {
        window.addNotification(errorMsg, 'error');
      }
    }
  };

  const handleCancelTrip = async (id) => {
    const trip = trips.find((t) => t.id === id);
    if (!trip) return;

    if (trip.status === 'COMPLETED') {
      if (window.addNotification) {
        window.addNotification('Cannot cancel a completed trip!', 'warning');
      }
      return;
    }

    if (trip.status === 'CANCELLED') {
      if (window.addNotification) {
        window.addNotification('Trip is already cancelled!', 'warning');
      }
      return;
    }

    if (window.confirm('Are you sure you want to cancel this trip?')) {
      try {
        await tripService.cancel(id);
        if (window.addNotification) {
          window.addNotification('Trip cancelled successfully!', 'success');
        }
        fetchTrips();
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message || 'Error cancelling trip!';
        if (window.addNotification) {
          window.addNotification(errorMsg, 'error');
        }
      }
    }
  };

  const handleExport = () => {
    const exportData = filteredTrips.map((t) => ({
      ID: `TRP-${t.id}`,
      Vehicle: t.vehicle?.licensePlate || 'N/A',
      Driver: t.driver?.user?.username || 'N/A',
      'Start Time': t.startTime ? new Date(t.startTime).toLocaleString() : 'N/A',
      Status: t.status,
      'Distance (km)': t.distanceCovered || 0,
    }));
    exportToCSV(exportData, 'trips');
  };

  const total = trips.length;
  const completed = trips.filter((t) => t.status === 'COMPLETED').length;
  const inProgress = trips.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ACTIVE').length;
  const scheduled = trips.filter((t) => t.status === 'SCHEDULED').length;
  const cancelled = trips.filter((t) => t.status === 'CANCELLED').length;

  const filteredTrips = trips.filter((t) => {
    const matchesTab =
      activeTab === 'ALL' ||
      (activeTab === 'IN_PROGRESS' && (t.status === 'IN_PROGRESS' || t.status === 'ACTIVE')) ||
      (activeTab === 'SCHEDULED' && t.status === 'SCHEDULED') ||
      (activeTab === 'COMPLETED' && t.status === 'COMPLETED') ||
      (activeTab === 'CANCELLED' && t.status === 'CANCELLED');

    const matchesSearch =
      !searchTerm ||
      t.vehicle?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.driver?.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `trp-${t.id}`.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const tabs = [
    { id: 'ALL', label: 'All Trips', count: total },
    { id: 'IN_PROGRESS', label: 'In Progress', count: inProgress },
    { id: 'SCHEDULED', label: 'Scheduled', count: scheduled },
    { id: 'COMPLETED', label: 'Completed', count: completed },
    { id: 'CANCELLED', label: 'Cancelled', count: cancelled },
  ];

  const columns = [
    {
      header: 'Trip Code',
      accessor: 'id',
      render: (row) => (
        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded text-xs">
          TRP-{row.id}
        </span>
      ),
    },
    {
      header: 'Vehicle',
      accessor: 'vehicle',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Icon name="Truck" size={16} className="text-slate-400" />
          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              {row.vehicle?.licensePlate || 'Unassigned'}
            </div>
            <div className="text-[10px] text-slate-400">
              {row.vehicle?.model || 'Fleet Vehicle'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Driver',
      accessor: 'driver',
      render: (row) => {
        const username = row.driver?.user?.username || 'Unassigned';
        return (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-[10px]">
              {username[0]?.toUpperCase() || 'D'}
            </div>
            <div>
              <div className="font-medium text-slate-800 dark:text-slate-200">
                {username}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Start Time',
      accessor: 'startTime',
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {row.startTime ? new Date(row.startTime).toLocaleString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Distance Covered',
      accessor: 'distanceCovered',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Icon name="MapPin" size={14} className="text-slate-400" />
          <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
            {(row.distanceCovered || 0).toLocaleString()} km
          </span>
        </div>
      ),
    },
    {
      header: 'Actions',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {(row.status === 'IN_PROGRESS' || row.status === 'ACTIVE') && (
            <button
              onClick={() => handleEndTrip(row.id)}
              className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1"
            >
              <Icon name="Check" size={14} />
              <span>End Trip</span>
            </button>
          )}
          {(row.status === 'SCHEDULED' || row.status === 'IN_PROGRESS' || row.status === 'ACTIVE') && (
            <button
              onClick={() => handleCancelTrip(row.id)}
              className="px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg transition-colors flex items-center gap-1"
            >
              <Icon name="X" size={14} />
              <span>Cancel</span>
            </button>
          )}
          {(row.status === 'COMPLETED' || row.status === 'CANCELLED') && (
            <span className="text-xs text-slate-400 dark:text-slate-600">—</span>
          )}
        </div>
      ),
    },
  ];

  if (loading && trips.length === 0) {
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
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Fleet Trips
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dispatch, track, and review active journeys across your fleet network.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExport}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Icon name="Download" size={15} />
            <span>Export CSV</span>
          </button>

          {user && (user.role === 'FLEET_MANAGER' || user.role === 'DISPATCHER') && (
            <>
              <button
                onClick={() => setShowScheduleForm(true)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Icon name="Calendar" size={15} />
                <span>Schedule Trip</span>
              </button>

              <button
                onClick={() => setShowForm(true)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5"
              >
                <Icon name="Navigation" size={15} />
                <span>Dispatch Vehicle</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="Route"
          iconColor="blue"
          label="Total Trips"
          value={total}
          subtext="Lifetime dispatched routes"
          trend={{ value: '+8 this week', positive: true }}
        />
        <StatCard
          icon="CheckCircle2"
          iconColor="green"
          label="Completed"
          value={completed}
          subtext="Successfully delivered"
          progress={{ percent: Math.round((completed / (total || 1)) * 100), color: 'green' }}
        />
        <StatCard
          icon="Navigation"
          iconColor="amber"
          label="In Progress"
          value={inProgress}
          subtext="Active on route"
          progress={{ percent: Math.round((inProgress / (total || 1)) * 100), color: 'amber' }}
        />
        <StatCard
          icon="Calendar"
          iconColor="indigo"
          label="Scheduled"
          value={scheduled}
          subtext="Upcoming departures"
          progress={{ percent: Math.round((scheduled / (total || 1)) * 100), color: 'indigo' }}
        />
      </div>

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={filteredTrips}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by Trip Code, Vehicle, Driver, or status..."
        isLoading={loading}
        emptyMessage={searchTerm ? 'No trips match search' : 'No trips available'}
        emptySubtext={searchTerm ? 'Try adjusting your search query.' : 'Click "Dispatch Vehicle" to start a new trip.'}
      />

      {/* MODALS */}
      {showForm && (
        <TripForm onClose={() => { setShowForm(false); fetchTrips(); }} />
      )}

      {showScheduleForm && (
        <ScheduleTripForm onClose={() => { setShowScheduleForm(false); fetchTrips(); }} />
      )}
    </div>
  );
};

export default TripList;