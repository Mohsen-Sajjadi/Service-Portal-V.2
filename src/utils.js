export const downloadCSV = (data, filename) => {
  if (!data || !data.length) {
    console.log("No data to export");
    return;
  }

  // List of columns to exclude
  const excludedColumns = ['project', 'projectId', 'id'];

  const csvRows = [];
  // Filter headers to exclude unwanted columns
  const headers = Object.keys(data[0]).filter(header => !excludedColumns.includes(header));
  csvRows.push(headers.join(','));

  for (const row of data) {
    // Filter values to exclude unwanted columns
    const values = headers.map(header => {
      const escaped = ('' + row[header]).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
