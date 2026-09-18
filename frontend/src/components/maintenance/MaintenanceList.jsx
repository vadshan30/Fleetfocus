import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import maintenanceService from '../../services/maintenanceService';
import MaintenanceForm from './MaintenanceForm';
import { exportToCSV } from '../../utils/exportUtils';

// UI Components
import StatCard from '../ui/StatCard';
import DataTable from '../ui/DataTable';
import Icon from '../ui/Icon';
import SkeletonLoader from '../common/SkeletonLoader';

const MaintenanceList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await maintenanceService.getAll();
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching maintenance logs:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    if (location.state?.vehicleId) {
      setSelectedVehicleId(location.state.vehicleId);
      setShowForm(true);
    }
  }, [location.state]);

  const handleExport = () => {
    const exportData = filteredLogs.map((l) => ({
      'Service Date': l.serviceDate ? new Date(l.serviceDate).toLocaleString() : 'N/A',
      Vehicle: l.vehicle?.licensePlate || 'N/A',
      Model: l.vehicle?.model || 'N/A',
      Technician: l.technician?.username || 'N/A',
      Description: l.description,
      'Cost ($)': l.cost || 0,
    }));
    exportToCSV(exportData, 'maintenance_logs');
  };

  const handleClose = () => {
    setShowForm(false);
    setSelectedVehicleId(null);
    fetchLogs();
  };

  const total = logs.length;
  const totalCost = logs.reduce((sum, l) => sum + (l.cost || 0), 0);
  const avgCost = total > 0 ? totalCost / total : 0;
  const thisMonth = logs.filter((l) => {
    const d = new Date(l.serviceDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !searchTerm ||
      log.vehicle?.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.technician?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const columns = [
    {
      header: 'Service Date',
      accessor: 'serviceDate',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Icon name="Calendar" size={15} className="text-slate-400 shrink-0" />
          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            {row.serviceDate ? new Date(row.serviceDate).toLocaleString() : 'N/A'}
          </span>
        </div>
      ),
    },
    {
      header: 'Vehicle',
      accessor: 'vehicle',
      render: (row) => (
        <div>
          <span className="font-semibold text-xs text-blue-600 dark:text-blue-400 font-mono block">
            {row.vehicle?.licensePlate || 'N/A'}
          </span>
          <span className="text-[10px] text-slate-400">
            {row.vehicle?.model || 'Fleet Vehicle'}
          </span>
        </div>
      ),
    },
    {
      header: 'Technician',
      accessor: 'technician',
      render: (row) => {
        const techName = row.technician?.username || 'N/A';
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-[10px]">
              {techName[0]?.toUpperCase() || 'T'}
            </div>
            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
              {techName}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Service Description',
      accessor: 'description',
      render: (row) => (
        <p className="text-xs text-slate-700 dark:text-slate-300 max-w-md line-clamp-2">
          {row.description}
        </p>
      ),
    },
    {
      header: 'Cost',
      accessor: 'cost',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (row) => (
        <span className="inline-flex items-center font-semibold text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
          ${(row.cost || 0).toFixed(2)}
        </span>
      ),
    },
  ];

  if (loading && logs.length === 0) {
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
            Maintenance Logs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track service records, repair costs, and technician inspections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
          >
            <Icon name="Download" size={16} />
            <span>Export CSV</span>
          </button>

          {user && (user.role === 'FLEET_MANAGER' || user.role === 'MAINTENANCE_TECH') && (
            <button
              onClick={() => { setSelectedVehicleId(null); setShowForm(true); }}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <Icon name="Wrench" size={16} />
              <span>Log Maintenance</span>
            </button>
          )}
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="Wrench"
          iconColor="blue"
          label="Total Services"
          value={total}
          subtext="Completed service entries"
          trend={{ value: `${thisMonth} this month`, positive: true }}
        />
        <StatCard
          icon="DollarSign"
          iconColor="green"
          label="Total Spent"
          value={`$${totalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          subtext="Cumulative maintenance expenditure"
        />
        <StatCard
          icon="Activity"
          iconColor="amber"
          label="Avg Cost / Service"
          value={`$${avgCost.toFixed(0)}`}
          subtext="Average cost per log"
        />
        <StatCard
          icon="Calendar"
          iconColor="purple"
          label="This Month"
          value={thisMonth}
          subtext="Service events in current month"
        />
      </div>

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={filteredLogs}
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search vehicle, license, technician, description..."
        isLoading={loading}
        emptyMessage={searchTerm ? 'No maintenance logs match search' : 'No service logs yet'}
        emptySubtext={searchTerm ? 'Try a different search query.' : 'Click "Log Maintenance" to record service.'}
      />

      {/* FORM MODAL */}
      {showForm && (
        <MaintenanceForm
          onClose={handleClose}
          preselectedVehicleId={selectedVehicleId}
        />
      )}
    </div>
  );
};

export default MaintenanceList;