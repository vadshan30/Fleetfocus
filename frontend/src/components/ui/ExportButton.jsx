import React from 'react';
import { exportToPDF, exportToExcel, prepareChartExportData } from '../../utils/exportUtils';
import Icon from './Icon';

const ExportButton = ({
  chartType,
  data,
  title,
  subtitle,
  filename,
  className = '',
  disabled = false,
}) => {
  const handleExportPDF = () => {
    const exportData = prepareChartExportData(data, chartType);
    exportToPDF(exportData, filename, title, subtitle);
  };

  const handleExportExcel = () => {
    const exportData = prepareChartExportData(data, chartType);
    exportToExcel(exportData, filename);
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={handleExportPDF}
        disabled={disabled}
        className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        title="Export as PDF"
      >
        <Icon name="FileText" size={14} />
        <span>PDF</span>
      </button>
      <button
        type="button"
        onClick={handleExportExcel}
        disabled={disabled}
        className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        title="Export as Excel"
      >
        <Icon name="Table" size={14} />
        <span>Excel</span>
      </button>
    </div>
  );
};

export default ExportButton;