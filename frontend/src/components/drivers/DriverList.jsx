import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import driverService from '../../services/driverService';
import DriverForm from './DriverForm';
import { exportToCSV } from '../../utils/exportUtils';

// UI Components
import StatCard from '../ui/StatCard';
import StatusBadge from '../ui/StatusBadge';
import DataTable from '../ui/DataTable';
import Icon from '../ui/Icon';
import SkeletonLoader from '../common/SkeletonLoader';

const DriverList = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const user = useSelector((state) => state.auth.user);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const data = await driverService.getAll();
      setDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleAdd = () => {
    setSelectedDriver(null);
    setShowModal(true);
  };

  const handleEdit = (driver) => {
    setSelectedDriver(driver);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await driverService.delete(id);
        if (window.addNotification) {
          window.addNotification('Driver deleted successfully!', 'success');
        }
        fetchDrivers();
      } catch (error) {
        if (window.addNotification) {
          window.addNotification('Error deleting driver!', 'error');
        }
      }
    }
  };

  const handleExport = () => {
    const exportData = filteredDrivers.map((d) => ({
      Username: d.user?.username || 'N/A',
      Email: d.user?.email || 'N/A',
      'License Number': d.licenseNumber || 'N/A',
      Status: d.status || 'N/A',
    }));
    exportToCSV(exportData, 'drivers');
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedDriver(null);
    fetchDrivers();
  };

  const total = drivers.length;
  const available = drivers.filter((d) => d.status === 'AVAILABLE').length;
  const onTrip = drivers.filter((d) => d.status === 'ON_TRIP').length;
  const offDuty = drivers.filter((d) => d.status === 'OFF_DUTY').length;

  const filteredDrivers = drivers.filter((d) => {
    const matchesTab =
      activeTab === 'ALL' ||
      (activeTab === 'AVAILABLE' && d.status === 'AVAILABLE') ||
      (activeTab === 'ON_TRIP' && d.status === 'ON_TRIP') ||
      (activeTab === 'OFF_DUTY' && d.status === 'OFF_DUTY');

    const matchesSearch =
      !searchTerm ||
      d.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.status?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const tabs = [
    { id: 'ALL', label: 'All Drivers', count: total },
    { id: 'AVAILABLE', label: 'Available', count: available },
    { id: 'ON_TRIP', label: 'On Trip', count: onTrip },
    { id: 'OFF_DUTY', label: 'Off Duty', count: offDuty },
  ];

  const getInitials = (name) => {
    if (!name) return 'D';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const columns = [
    {
      header: 'Driver',
      accessor: 'user',
      render: (row) => {
        const username = row.user?.username || 'Unknown Driver';
        const email = row.user?.email || 'N/A';
        const initials = getInitials(username);
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
              {initials}
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <span>{username}</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  Verified
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: 'License Number',
      accessor: 'licenseNumber',
      render: (row) => (
        <div>
          <span className="font-mono text-xs font-medium text-slate-800 dark:text-slate-200">
            {row.licenseNumber || 'N/A'}
          </span>
          <div className="text-[10px] text-slate-400">Class A Commercial</div>
        </div>
      ),
    },
    {
      header: 'Safety Rating',
      accessor: 'rating',
      render: () => (
        <div className="flex items-center gap-1.5">
          <div className="flex text-amber-400">
            <Icon name="Star" size={14} className="fill-amber-400 text-amber-400" />
          </div>
          <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
            4.9
          </span>
          <span className="text-[10px] text-slate-400">(120+ trips)</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    ...(user && user.role === 'FLEET_MANAGER'
      ? [
          {
            header: 'Actions',
            headerClassName: 'text-right',
            className: 'text-right',
            render: (row) => (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => handleEdit(row)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Icon name="Edit" size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Icon name="Trash2" size={14} />
                  <span>Delete</span>
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  if (loading && drivers.length === 0) {
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
            Driver Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your fleet operators, verify licenses, and monitor availability.
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

          {user && user.role === 'FLEET_MANAGER' && (
            <button
              onClick={handleAdd}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <Icon name="Plus" size={16} />
              <span>Add Driver</span>
            </button>
          )}
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="Users"
          iconColor="blue"
          label="Total Drivers"
          value={total}
          subtext="Certified fleet operators"
          trend={{ value: '+4 active', positive: true }}
        />
        <StatCard
          icon="CheckCircle2"
          iconColor="green"
          label="Available"
          value={available}
          subtext="Ready for dispatch"
          progress={{ percent: Math.round((available / (total || 1)) * 100), color: 'green' }}
        />
        <StatCard
          icon="Navigation"
          iconColor="amber"
          label="On Trip"
          value={onTrip}
          subtext="Currently driving active routes"
          progress={{ percent: Math.round((onTrip / (total || 1)) * 100), color: 'amber' }}
        />
        <StatCard
          icon="Clock"
          iconColor="slate"
          label="Off Duty"
          value={offDuty}
          subtext="Resting / on break"
          progress={{ percent: Math.round((offDuty / (total || 1)) * 100), color: 'slate' }}
        />
      </div>

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={filteredDrivers}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search driver username, email, license, or status..."
        isLoading={loading}
        emptyMessage={searchTerm ? 'No drivers match search' : 'No drivers found'}
        emptySubtext={searchTerm ? 'Try a different search term.' : 'Click "Add Driver" to register one.'}
      />

      {/* MODAL */}
      {showModal && (
        <DriverForm driver={selectedDriver} onClose={handleClose} />
      )}
    </div>
  );
};

export default DriverList;