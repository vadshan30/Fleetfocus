import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const notify = (message, type = 'success') => {
  if (window.addNotification) {
    window.addNotification(message, type);
  }
};

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    notify('No data to export!', 'error');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map((header) => {
      let val = row[header] || '';
      if (typeof val === 'string' && val.includes(',')) {
        val = `"${val}"`;
      }
      if (typeof val === 'string' && val.includes('"')) {
        val = val.replace(/"/g, '""');
        val = `"${val}"`;
      }
      return val;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  notify(`Exported ${data.length} records to CSV`, 'success');
};

export const exportToPDF = (data, filename, title, subtitle = '') => {
  if (!data || data.length === 0) {
    notify('No data to export!', 'error');
    return;
  }

  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 20, { align: 'center' });

    if (subtitle) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(subtitle, pageWidth / 2, 28, { align: 'center' });
    }

    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      `Generated: ${new Date().toLocaleString()} | Records: ${data.length}`,
      pageWidth / 2,
      34,
      { align: 'center' }
    );

    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((h) => row[h] || ''));

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 40,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      alternateRowStyles: { fillColor: [241, 245, 249] },
      margin: { top: 40 },
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    doc.save(`${filename}_${dateStr}.pdf`);

    notify(`Exported ${data.length} records to PDF`, 'success');
  } catch (err) {
    console.error('PDF export failed:', err);
    notify('PDF export failed', 'error');
  }
};

export const exportPeriodComparisonPDF = (comparisonData, filename = 'fleetfocus-period-comparison') => {
  if (!comparisonData) {
    notify('No comparison data to export!', 'error');
    return;
  }

  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('FleetFocus Multi-Period Analytics Comparison', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    doc.text(
      `Range A: ${comparisonData.rangeALabel || 'Primary'}  vs  Range B: ${comparisonData.rangeBLabel || 'Comparison'}`,
      pageWidth / 2,
      28,
      { align: 'center' }
    );

    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(
      `Exported: ${new Date().toLocaleString()} | Operational Comparison Report`,
      pageWidth / 2,
      34,
      { align: 'center' }
    );

    const formatDelta = (delta) => {
      if (!delta) return { change: '0.0%', dir: 'FLAT' };
      const pct = (delta.percentChange || 0).toFixed(1);
      const sign = delta.percentChange > 0 ? '+' : '';
      return { change: `${sign}${pct}%`, dir: delta.direction || 'FLAT' };
    };

    const tableRows = [
      [
        'Total Completed Trips',
        String(comparisonData.totalTripsA ?? 0),
        String(comparisonData.totalTripsB ?? 0),
        String(Math.round(((comparisonData.tripsDelta?.value || 0) * 10)) / 10),
        formatDelta(comparisonData.tripsDelta).change,
      ],
      [
        'Total Distance (km)',
        `${comparisonData.totalDistanceA ?? 0} km`,
        `${comparisonData.totalDistanceB ?? 0} km`,
        `${Math.round(((comparisonData.distanceDelta?.value || 0) * 10)) / 10} km`,
        formatDelta(comparisonData.distanceDelta).change,
      ],
      [
        'Fuel Consumption (L)',
        `${comparisonData.totalFuelA ?? 0} L`,
        `${comparisonData.totalFuelB ?? 0} L`,
        `${Math.round(((comparisonData.fuelDelta?.value || 0) * 10)) / 10} L`,
        formatDelta(comparisonData.fuelDelta).change,
      ],
      [
        'Total Cost ($)',
        `$${(comparisonData.totalCostA ?? 0).toFixed(2)}`,
        `$${(comparisonData.totalCostB ?? 0).toFixed(2)}`,
        `$${((comparisonData.costDelta?.value || 0)).toFixed(2)}`,
        formatDelta(comparisonData.costDelta).change,
      ],
      [
        'Alerts Triggered',
        String(comparisonData.totalAlertsA ?? 0),
        String(comparisonData.totalAlertsB ?? 0),
        String(comparisonData.alertsDelta?.value ?? 0),
        formatDelta(comparisonData.alertsDelta).change,
      ],
      [
        'Average Fleet Utilization',
        `${comparisonData.avgUtilizationA ?? 0}%`,
        `${comparisonData.avgUtilizationB ?? 0}%`,
        `${((comparisonData.utilizationDelta?.value || 0)).toFixed(1)}%`,
        formatDelta(comparisonData.utilizationDelta).change,
      ],
    ];

    autoTable(doc, {
      head: [['Operational Metric', `Range A (${comparisonData.rangeALabel || 'Current'})`, `Range B (${comparisonData.rangeBLabel || 'Previous'})`, 'Net Diff', 'Delta %']],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { top: 40 },
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    doc.save(`${filename}_${dateStr}.pdf`);

    notify('Exported Multi-Period Comparison report to PDF', 'success');
  } catch (err) {
    console.error('Period comparison PDF export failed:', err);
    notify('Comparison PDF export failed', 'error');
  }
};

export const exportToExcel = (data, filename, sheetName = 'Sheet1') => {
  if (!data || data.length === 0) {
    notify('No data to export!', 'error');
    return;
  }

  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);

    notify(`Exported ${data.length} records to Excel`, 'success');
  } catch (err) {
    console.error('Excel export failed:', err);
    notify('Excel export failed', 'error');
  }
};

export const prepareChartExportData = (chartData, chartType) => {
  switch (chartType) {
    case 'costBreakdown':
      return chartData.map((d) => ({
        Category: d.name,
        Amount: d.value,
        'Share (%)': d.percent ? d.percent.toFixed(1) : '0.0',
      }));
    case 'driverComparison':
      return chartData.map((d) => ({
        Driver: d.name,
        'Total Trips': d.totalTrips,
        'Completed Trips': d.completedTrips,
        'Completion Rate (%)':
          d.totalTrips > 0
            ? ((d.completedTrips / d.totalTrips) * 100).toFixed(1)
            : '0.0',
      }));
    case 'fleetUtilization':
      return chartData.map((d) => ({
        Date: d.displayDate,
        'Utilization (%)': d.utilization,
        'Availability (%)': d.available,
      }));
    case 'tripHeatmap':
      return chartData.map((d) => ({
        Day: d.day,
        Hour: d.hour,
        Trips: d.count,
        Intensity: d.intensity,
      }));
    default:
      return chartData;
  }
};