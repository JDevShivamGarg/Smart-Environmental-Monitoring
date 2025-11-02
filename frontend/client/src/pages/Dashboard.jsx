import { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/Data-table';
import Chart from '../components/Chart';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState('All');

  const fetchData = () => {
    setLoading(true);
    axios.get('http://localhost:8000/api/data')
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const cities = ['All', ...new Set(data.map(item => item.city))];

  const filteredData = data.filter(item => selectedCity === 'All' || item.city === selectedCity);

  if (loading && data.length === 0) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Dashboard</h1>
      <div className="mb-4">
        <label htmlFor="city-filter" className="mr-2">Filter by city:</label>
        <select
          id="city-filter"
          value={selectedCity}
          onChange={e => setSelectedCity(e.target.value)}
          className="p-2 rounded border"
        >
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Chart data={filteredData} dataKey="temperature_celsius" title="Temperature (°C)" color="#8884d8" />
        <Chart data={filteredData} dataKey="aqi" title="Air Quality Index (AQI)" color="#82ca9d" />
      </div>
      <DataTable data={filteredData} />
    </div>
  );
};

export default Dashboard;
