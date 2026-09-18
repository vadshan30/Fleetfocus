export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('No data to export!');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => {
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
  link.download = `${filename}_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  if (window.addNotification) {
    window.addNotification(`Exported ${data.length} records successfully!`, 'success');
  }
};