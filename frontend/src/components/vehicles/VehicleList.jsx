import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles } from '../../store/slices/vehicleSlice';
import VehicleForm from './VehicleForm';
import vehicleService from '../../services/vehicleService';
import { exportToCSV } from '../../utils/exportUtils';

// UI Components
import StatCard from '../ui/StatCard';
import StatusBadge from '../ui/StatusBadge';
import DataTable from '../ui/DataTable';
import Icon from '../ui/Icon';
import SkeletonLoader from '../common/SkeletonLoader';

const VehicleList = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const dispatch = useDispatch();
  const { items, pagination, loading } = useSelector((state) => state.vehicles);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchVehicles({ page: currentPage, size: 10 }));
  }, [dispatch, currentPage]);

  const handleAdd = () => {
    setSelectedVehicle(null);
    setShowModal(true);
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await vehicleService.delete(id);
        if (window.addNotification) {
          window.addNotification('Vehicle deleted successfully!', 'success');
        }
        dispatch(fetchVehicles({ page: currentPage, size: 10 }));
      } catch (error) {
        if (window.addNotification) {
          window.addNotification('Error deleting vehicle!', 'error');
        }
      }
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedVehicle(null);
    dispatch(fetchVehicles({ page: currentPage, size: 10 }));
  };

  const handleExport = () => {
    const exportData = filteredItems.map((v) => ({
      VIN: v.vin,
      'License Plate': v.licensePlate,
      Model: v.model,
      Status: v.status,
      Mileage: v.currentMileage || 0,
    }));
    exportToCSV(exportData, 'vehicles');
  };

  // Counts for tabs & stat cards
  const total = items.length;
  const available = items.filter((v) => v.status === 'AVAILABLE').length;
  const onTrip = items.filter((v) => v.status === 'ON_TRIP').length;
  const maintenance = items.filter((v) => v.status === 'UNDER_MAINTENANCE' || v.status === 'MAINTENANCE').length;

  // Filter items by status tab and search term
  const filteredItems = items.filter((item) => {
    const matchesTab =
      activeTab === 'ALL' ||
      (activeTab === 'AVAILABLE' && item.status === 'AVAILABLE') ||
      (activeTab === 'ON_TRIP' && item.status === 'ON_TRIP') ||
      (activeTab === 'MAINTENANCE' && (item.status === 'UNDER_MAINTENANCE' || item.status === 'MAINTENANCE'));

    const matchesSearch =
      !searchTerm ||
      item.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.licensePlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const tabs = [
    { id: 'ALL', label: 'All Vehicles', count: total },
    { id: 'AVAILABLE', label: 'Available', count: available },
    { id: 'ON_TRIP', label: 'On Trip', count: onTrip },
    { id: 'MAINTENANCE', label: 'Maintenance', count: maintenance },
  ];

  const columns = [
    {
      header: 'Vehicle VIN',
      accessor: 'vin',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Icon name="Truck" size={16} />
          </div>
          <div>
            <div className="font-mono font-semibold text-blue-600 dark:text-blue-400">
              {row.vin}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {row.licensePlate}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Model / Type',
      accessor: 'model',
      render: (row) => (
        <span className="font-medium text-slate-900 dark:text-slate-100">
          {row.model}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Mileage & Health',
      accessor: 'currentMileage',
      render: (row) => {
        const mileage = (row.currentMileage || 0).toLocaleString();
        const fuelPercent = Math.min(100, Math.max(20, (100000 - ((row.currentMileage || 0) % 100000)) / 1000));
        return (
          <div className="w-48">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {mileage} km
              </span>
              <span className="text-[10px] text-slate-400">
                Fuel ~{Math.round(fuelPercent)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  fuelPercent < 25
                    ? 'bg-rose-500'
                    : fuelPercent < 50
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${fuelPercent}%` }}
              />
            </div>
          </div>
        );
      },
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(row);
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Icon name="Edit" size={14} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(row.id);
                  }}
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

  if (loading && items.length === 0) {
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
            Vehicle Inventory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your entire fleet, track vehicle status and maintenance lifecycle.
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
              <span>Add Vehicle</span>
            </button>
          )}
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="Truck"
          iconColor="blue"
          label="Total Fleet"
          value={total}
          subtext="Active vehicles registered"
          trend={{ value: '+2 this month', positive: true }}
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
          subtext="Currently en route"
          progress={{ percent: Math.round((onTrip / (total || 1)) * 100), color: 'amber' }}
        />
        <StatCard
          icon="Wrench"
          iconColor="red"
          label="Maintenance"
          value={maintenance}
          subtext="Under inspection / repair"
          progress={{ percent: Math.round((maintenance / (total || 1)) * 100), color: 'red' }}
        />
      </div>

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={filteredItems}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search VIN, model, plate, or status..."
        isLoading={loading}
        emptyMessage={searchTerm ? 'No vehicles match search' : 'No vehicles found'}
        emptySubtext={searchTerm ? 'Try a different search query.' : 'Click "Add Vehicle" to register one.'}
        pagination={{
          currentPage: currentPage + 1,
          totalPages: pagination.totalPages || 1,
          totalItems: pagination.totalElements || filteredItems.length,
          itemsPerPage: 10,
          onPageChange: (p) => setCurrentPage(p - 1),
        }}
      />

      {/* MODAL */}
      {showModal && (
        <VehicleForm vehicle={selectedVehicle} onClose={handleClose} />
      )}
    </div>
  );
};

export default VehicleList;