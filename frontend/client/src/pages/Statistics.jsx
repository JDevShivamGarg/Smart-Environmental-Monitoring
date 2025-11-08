import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getCachedData, setCachedData, shouldFetchFreshData, markDataFetched } from '../utils/cache';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      // Check cache first
      const cachedStats = getCachedData('stats_data');
      if (cachedStats) {
        console.log('Using cached stats');
        setStats(cachedStats);
        setLoading(false);
        toast.success('Statistics loaded from cache');
        return;
      }

      // Fetch from API
      try {
        const response = await axios.get('http://localhost:8000/api/stats');
        setStats(response.data);
        setCachedData('stats_data', response.data);
        setLoading(false);
        toast.success('Statistics loaded');
      } catch (err) {
        setError(err.message);
        setLoading(false);
        toast.error('Failed to load statistics');
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Data Statistics</h1>
      {stats && (
        <div>
          <h2 className="text-2xl font-bold mb-2">Descriptive Statistics</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-3 px-4 uppercase font-semibold text-sm text-left">Metric</th>
                  {Object.keys(stats.descriptive_stats).map(col => (
                    <th key={col} className="py-3 px-4 uppercase font-semibold text-sm text-left">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {Object.keys(stats.descriptive_stats[Object.keys(stats.descriptive_stats)[0]]).map(metric => (
                  <tr key={metric} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-4 font-bold">{metric}</td>
                    {Object.keys(stats.descriptive_stats).map(col => (
                      <td key={col} className="py-3 px-4">{stats.descriptive_stats[col][metric].toFixed(2)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-2">Correlation Matrix</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-3 px-4 uppercase font-semibold text-sm text-left"></th>
                  {Object.keys(stats.correlation_matrix).map(col => (
                    <th key={col} className="py-3 px-4 uppercase font-semibold text-sm text-left">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {Object.keys(stats.correlation_matrix).map(row => (
                  <tr key={row} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-4 font-bold">{row}</td>
                    {Object.keys(stats.correlation_matrix[row]).map(col => (
                      <td key={col} className="py-3 px-4">{stats.correlation_matrix[row][col].toFixed(2)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
