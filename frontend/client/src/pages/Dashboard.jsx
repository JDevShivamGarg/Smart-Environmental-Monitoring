import { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from '../components/Data-table';
import Chart from '../components/Chart';
import Clock from '../components/Clock';
import SyncTimer from '../components/SyncTimer';

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
    const intervalId = setInterval(fetchData, 600000); // 10 minutes

    return () => clearInterval(intervalId);
  }, []);

  const cities = ['All', ...new Set(data.map(item => item.city))];

  const filteredData = data.filter(item => selectedCity === 'All' || item.city === selectedCity);

  const createAcronym = (name) => {
    if (name.includes(' ')) {
      return name.split(' ').map(word => word[0]).join('');
    }
    return name;
  };

  // Get the latest entry for each city for the 'All' view
  const latestDataForAllCities = Array.from(
    data.reduce((map, item) => {
      if (!map.has(item.city) || new Date(item.ingestion_timestamp) > new Date(map.get(item.city).ingestion_timestamp)) {
        map.set(item.city, { ...item, city: createAcronym(item.city) });
      }
      return map;
    }, new Map()).values()
  );

  if (loading && data.length === 0) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Clock />
          <SyncTimer interval={600000} />
        </div>
      </div>
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
        <Chart 
          data={selectedCity === 'All' ? latestDataForAllCities : filteredData} 
          dataKey="temperature_celsius" 
          title="Temperature (°C)" 
          color="#8884d8" 
          type={selectedCity === 'All' ? 'bar' : 'line'}
          xAxisKey={selectedCity === 'All' ? 'city' : 'ingestion_timestamp'}
        />
        <Chart 
          data={selectedCity === 'All' ? latestDataForAllCities : filteredData} 
          dataKey="aqi" 
          title="Air Quality Index (AQI)" 
          color="#82ca9d" 
          type={selectedCity === 'All' ? 'bar' : 'line'}
          xAxisKey={selectedCity === 'All' ? 'city' : 'ingestion_timestamp'}
        />
      </div>
      <DataTable data={filteredData} />
    </div>
  );
};

export default Dashboard;
