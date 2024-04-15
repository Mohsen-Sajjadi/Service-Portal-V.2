export const downloadCSV = (data, filename) => {
    if (!data || !data.length) {
      console.log("No data to export");
      return;
    }
  
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));
  
    for (const row of data) {
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