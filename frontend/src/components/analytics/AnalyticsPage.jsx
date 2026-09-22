import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchVehicles } from '../../store/slices/vehicleSlice';
import tripService from '../../services/tripService';
import driverService from '../../services/driverService';
import maintenanceService from '../../services/maintenanceService';
import analyticsService from '../../services/analyticsService';
import { exportPeriodComparisonPDF } from '../../utils/exportUtils';
import { parseISO, isWithinInterval, startOfDay, endOfDay, subDays, format } from 'date-fns';

// UI
import StatCard from '../ui/StatCard';
import Icon from '../ui/Icon';

// Charts
import DateRangeFilter, { calculatePrecedingRange } from './DateRangeFilter';
import FleetUtilizationChart from './FleetUtilizationChart';
import DriverComparisonChart from './DriverComparisonChart';
import CostBreakdownChart from './CostBreakdownChart';
import TripHeatmap from './TripHeatmap';

const AnalyticsPage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const vehicles = useSelector((state) => state.vehicles.items);

  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Comparison State
  const [compareMode, setCompareMode] = useState(true);
  const [comparisonData, setComparisonData] = useState(null);

  const [dateRange, setDateRange] = useState(() => {
    const end = endOfDay(new Date());
    const start = startOfDay(subDays(end, 29));
    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    };
  });

  const [rangeB, setRangeB] = useState(() =>
    calculatePrecedingRange({
      startDate: format(startOfDay(subDays(new Date(), 29)), 'yyyy-MM-dd'),
      endDate: format(endOfDay(new Date()), 'yyyy-MM-dd'),
    })
  );

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    dispatch(fetchVehicles({ page: 0, size: 100 }));
    Promise.all([
      tripService.getAll().catch(() => []),
      driverService.getAll().catch(() => []),
      maintenanceService.getAll().catch(() => []),
    ]).then(([t, d, m]) => {
      setTrips(t || []);
      setDrivers(d || []);
      setMaintenanceLogs(m || []);
      setIsLoading(false);
    });
  }, [dispatch, user]);

  useEffect(() => {
    if (!dateRange?.startDate || !dateRange?.endDate || !rangeB?.startDate || !rangeB?.endDate) return;

    analyticsService
      .compare(
        { start: dateRange.startDate, end: dateRange.endDate },
        { start: rangeB.startDate, end: rangeB.endDate }
      )
      .then((res) => {
        setComparisonData(res);
      })
      .catch((err) => {
        console.error('Error fetching analytics comparison:', err);
      });
  }, [dateRange, rangeB]);

  const filteredTripsA = useMemo(() => {
    if (!dateRange?.startDate || !dateRange?.endDate) return trips;
    const start = startOfDay(parseISO(dateRange.startDate));
    const end = endOfDay(parseISO(dateRange.endDate));
    return trips.filter((t) => {
      if (!t.startTime) return false;
      try {
        const tripStart = parseISO(t.startTime);
        return isWithinInterval(tripStart, { start, end });
      } catch {
        return false;
      }
    });
  }, [trips, dateRange]);

  const filteredTripsB = useMemo(() => {
    if (!rangeB?.startDate || !rangeB?.endDate) return [];
    const start = startOfDay(parseISO(rangeB.startDate));
    const end = endOfDay(parseISO(rangeB.endDate));
    return trips.filter((t) => {
      if (!t.startTime) return false;
      try {
        const tripStart = parseISO(t.startTime);
        return isWithinInterval(tripStart, { start, end });
      } catch {
        return false;
      }
    });
  }, [trips, rangeB]);

  const filteredMaintenanceLogsB = useMemo(() => {
    if (!rangeB?.startDate || !rangeB?.endDate) return [];
    const start = startOfDay(parseISO(rangeB.startDate));
    const end = endOfDay(parseISO(rangeB.endDate));
    return maintenanceLogs.filter((l) => {
      const dateStr = l.serviceDate || l.createdAt;
      if (!dateStr) return false;
      try {
        const d = parseISO(dateStr);
        return isWithinInterval(d, { start, end });
      } catch {
        return false;
      }
    });
  }, [maintenanceLogs, rangeB]);

  const rangeALabel = comparisonData?.rangeALabel || `${dateRange.startDate} – ${dateRange.endDate}`;
  const rangeBLabel = comparisonData?.rangeBLabel || `${rangeB.startDate} – ${rangeB.endDate}`;

  const handleExportPDF = () => {
    if (comparisonData) {
      exportPeriodComparisonPDF(comparisonData);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-2">
            <Icon name="BarChart2" size={14} /> Analytics v3
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Multi-Period Performance Comparison
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Evaluate period-over-period fleet productivity, cost fluctuations, driver output, and utilization deltas with SQL-aggregated metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportPDF}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
          >
            <Icon name="FileText" size={16} />
            <span>Export Comparison PDF</span>
          </button>
        </div>
      </div>

      {/* Date Range & Comparison Bar */}
      <DateRangeFilter
        value={dateRange}
        onChange={setDateRange}
        isLoading={isLoading}
        compareMode={compareMode}
        onCompareModeChange={setCompareMode}
        rangeB={rangeB}
        onRangeBChange={setRangeB}
      />

      {/* KPI Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon="Route"
          iconColor="blue"
          label="Trips"
          value={comparisonData?.totalTripsA ?? filteredTripsA.length}
          subtext={`vs ${comparisonData?.totalTripsB ?? filteredTripsB.length} in prev`}
          delta={comparisonData?.tripsDelta}
        />
        <StatCard
          icon="MapPin"
          iconColor="indigo"
          label="Distance"
          value={`${comparisonData?.totalDistanceA ?? 0} km`}
          subtext={`vs ${comparisonData?.totalDistanceB ?? 0} km`}
          delta={comparisonData?.distanceDelta}
        />
        <StatCard
          icon="Fuel"
          iconColor="amber"
          label="Fuel Used"
          value={`${comparisonData?.totalFuelA ?? 0} L`}
          subtext={`vs ${comparisonData?.totalFuelB ?? 0} L`}
          delta={comparisonData?.fuelDelta}
        />
        <StatCard
          icon="DollarSign"
          iconColor="green"
          label="Total Cost"
          value={`$${(comparisonData?.totalCostA ?? 0).toFixed(0)}`}
          subtext={`vs $${(comparisonData?.totalCostB ?? 0).toFixed(0)}`}
          delta={comparisonData?.costDelta ? { ...comparisonData.costDelta, invertColor: true } : null}
        />
        <StatCard
          icon="Bell"
          iconColor="red"
          label="Alerts"
          value={comparisonData?.totalAlertsA ?? 0}
          subtext={`vs ${comparisonData?.totalAlertsB ?? 0} in prev`}
          delta={comparisonData?.alertsDelta ? { ...comparisonData.alertsDelta, invertColor: true } : null}
        />
        <StatCard
          icon="Percent"
          iconColor="purple"
          label="Utilization"
          value={`${comparisonData?.avgUtilizationA ?? 0}%`}
          subtext={`vs ${comparisonData?.avgUtilizationB ?? 0}% in prev`}
          delta={comparisonData?.utilizationDelta}
        />
      </div>

      {/* Analytics Comparison Charts */}
      <FleetUtilizationChart
        trips={filteredTripsA}
        tripsB={filteredTripsB}
        vehicles={vehicles}
        compareMode={compareMode}
        rangeA={dateRange}
        rangeB={rangeB}
        rangeALabel={rangeALabel}
        rangeBLabel={rangeBLabel}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DriverComparisonChart
          drivers={drivers}
          trips={filteredTripsA}
          tripsB={filteredTripsB}
          compareMode={compareMode}
          rangeALabel={rangeALabel}
          rangeBLabel={rangeBLabel}
        />

        <CostBreakdownChart
          trips={filteredTripsA}
          tripsB={filteredTripsB}
          maintenanceLogs={maintenanceLogs}
          maintenanceLogsB={filteredMaintenanceLogsB}
          compareMode={compareMode}
          rangeALabel={rangeALabel}
          rangeBLabel={rangeBLabel}
        />
      </div>

      <TripHeatmap
        trips={filteredTripsA}
        tripsB={filteredTripsB}
        compareMode={compareMode}
        rangeALabel={rangeALabel}
        rangeBLabel={rangeBLabel}
      />
    </div>
  );
};

export default AnalyticsPage;
