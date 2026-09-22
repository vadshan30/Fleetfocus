import React from 'react';
import Icon from '../ui/Icon';
import StatusBadge from '../ui/StatusBadge';

const MyVehicleCard = ({ vehicle, telemetry }) => {
  if (!vehicle) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-sm text-center py-8 space-y-2">
        <Icon name="Truck" size={28} className="mx-auto text-slate-400" />
        <div className="text-sm font-bold text-slate-700 dark:text-slate-300">No Vehicle Assigned</div>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Contact dispatch to be assigned a vehicle for your next scheduled shift.
        </p>
      </div>
    );
  }

  const fuel = telemetry?.fuelLevel != null ? Math.round(telemetry.fuelLevel) : 85;
  const temp = telemetry?.engineTemp != null ? Math.round(telemetry.engineTemp) : 88;
  const speed = telemetry?.speed != null ? Math.round(telemetry.speed) : 0;
  const isOverheating = temp > 100;

  // Fuel bar color
  const fuelColor =
    fuel > 40
      ? 'bg-emerald-500'
      : fuel > 20
      ? 'bg-amber-500'
      : 'bg-rose-500';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Icon name="Truck" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono font-bold text-base text-slate-900 dark:text-slate-50">
                {vehicle.licensePlate}
              </h3>
              <StatusBadge status={vehicle.status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{vehicle.model}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold text-slate-400">Odometer</span>
          <div className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
            {(vehicle.currentMileage || 0).toLocaleString()} km
          </div>
        </div>
      </div>

      {/* Metrics Row: Speed, Fuel, Temp */}
      <div className="grid grid-cols-3 gap-2">
        {/* Speed */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
            <Icon name="Gauge" size={12} /> Speed
          </div>
          <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
            {speed} <span className="text-[10px] font-normal text-slate-400">km/h</span>
          </div>
        </div>

        {/* Fuel */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
            <Icon name="Fuel" size={12} /> Fuel
          </div>
          <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">
            {fuel}%
          </div>
        </div>

        {/* Engine Temp */}
        <div
          className={`p-2.5 rounded-xl border text-center transition-colors ${
            isOverheating
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300'
              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100'
          }`}
        >
          <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
            <Icon name="Thermometer" size={12} /> Temp
          </div>
          <div className="text-base font-extrabold mt-0.5">
            {temp}°C
          </div>
        </div>
      </div>

      {/* Fuel Level Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span>Fuel Tank Status</span>
          <span className="font-mono">{fuel}% Remaining</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${fuelColor}`}
            style={{ width: `${Math.min(100, Math.max(0, fuel))}%` }}
          />
        </div>
      </div>

      {/* Overheat Warning if > 100°C */}
      {isOverheating && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2 animate-pulse">
          <Icon name="AlertTriangle" size={16} className="text-rose-600 shrink-0" />
          <span>
            <strong>Engine Alert:</strong> High coolant temperature ({temp}°C). Please inspect or report issue.
          </span>
        </div>
      )}
    </div>
  );
};

export default MyVehicleCard;
