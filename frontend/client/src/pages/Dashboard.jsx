import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import DataTable from '../components/Data-table';
import Chart from '../components/Chart';
import Clock from '../components/Clock';
import SyncTimer from '../components/SyncTimer';
import { getCachedData, setCachedData, shouldFetchFreshData, markDataFetched } from '../utils/cache';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState('All');

  const fetchData = async (forceRefresh = false) => {
    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedData = getCachedData('dashboard_data');
      if (cachedData) {
        const dataArray = Array.isArray(cachedData) ? cachedData : (cachedData.data || cachedData);
        if (Array.isArray(dataArray) && dataArray.length > 0) {
          setData(dataArray);
          setLoading(false);
          toast.success('Data loaded from cache');
          return;
        }
      }
    }

    // Always fetch if no data exists, otherwise check 12 PM schedule
    const hasData = data.length > 0;
    if (!forceRefresh && hasData && !shouldFetchFreshData()) {
      setLoading(false);
      return;
    }

    // Fetch from API - get all historical data (backend will handle filtering)
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/data');
      const responseData = response.data.data || response.data;

      // Ensure we have an array
      const dataArray = Array.isArray(responseData) ? responseData : [];

      setData(dataArray);
      setCachedData('dashboard_data', dataArray);
      markDataFetched();
      setLoading(false);
      toast.success('Data refreshed successfully');
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
      setLoading(false);
      toast.error('Failed to fetch data');
    }
  };

  useEffect(() => {
    fetchData();

    // Check every hour if we need to fetch fresh data
    const intervalId = setInterval(() => {
      if (shouldFetchFreshData()) {
        fetchData(true);
      }
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(intervalId);
  }, []);

  const cities = ['All', ...new Set(data.map(item => item.city))];

  // Get the latest entry for each city
  const latestDataByCity = Array.from(
    data.reduce((map, item) => {
      if (!map.has(item.city) || new Date(item.ingestion_timestamp) > new Date(map.get(item.city).ingestion_timestamp)) {
        map.set(item.city, item);
      }
      return map;
    }, new Map()).values()
  );

  // Filter data based on selected city
  // If "All" is selected: show only latest data per city
  // If specific city is selected: show ALL historical data for that city
  const filteredData = selectedCity === 'All'
    ? latestDataByCity
    : data.filter(item => item.city === selectedCity).sort((a, b) =>
        new Date(b.ingestion_timestamp) - new Date(a.ingestion_timestamp)
      );

  const createAcronym = (name) => {
    if (name.includes(' ')) {
      return name.split(' ').map(word => word[0]).join('');
    }
    return name;
  };

  // Create acronym version for chart display (only for "All" view)
  const latestDataForAllCities = latestDataByCity.map(item => ({
    ...item,
    city: createAcronym(item.city)
  }));

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
          <SyncTimer />
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
