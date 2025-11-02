import { useState } from 'react';

const DataTable = ({ data }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  if (!data || data.length === 0) {
    return <div className="text-center p-8">No data available.</div>;
  }

  const columns = [
    { key: 'ingestion_timestamp', name: 'Timestamp' },
    { key: 'city', name: 'City' },
    { key: 'temperature_celsius', name: 'Temp (°C)', isNumeric: true },
    { key: 'pressure_hpa', name: 'Pressure (hPa)', isNumeric: true },
    { key: 'humidity_percent', name: 'Humidity (%)', isNumeric: true },
    { key: 'wind_speed_ms', name: 'Wind (m/s)', isNumeric: true },
    { key: 'aqi', name: 'AQI', isNumeric: true },
    { key: 'dominant_pollutant', name: 'Dominant Pollutant' },
  ];

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = () => {
    let sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead className="bg-gray-800 text-white">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="py-3 px-4 uppercase font-semibold text-sm text-left">
                <div className="flex items-center">
                  <span>{col.name}</span>
                  {col.isNumeric && (
                    <button onClick={() => handleSort(col.key)} className="ml-2">
                      {sortConfig.key === col.key ? (sortConfig.direction === 'ascending' ? '🔼' : '🔽') : '↕️'}
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {sortedData().map((row, index) => (
            <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
              {columns.map(col => (
                <td key={col.key} className="py-3 px-4">
                  {col.key === 'ingestion_timestamp' ? formatTimestamp(row[col.key]) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
