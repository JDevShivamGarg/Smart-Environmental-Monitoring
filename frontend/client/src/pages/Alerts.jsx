import { useState, useEffect } from 'react';
import { Bell, AlertCircle, AlertTriangle, CheckCircle, X, Filter, RefreshCw, Trash2 } from 'lucide-react';
import apiService from '../utils/apiService';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const Alerts = () => {
  const [data, setData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [thresholds, setThresholds] = useState({
    aqi: { critical: 200, warning: 100, enabled: true },
    temperature: { critical: 40, warning: 35, enabled: true },
    humidity: { critical: 85, warning: 70, enabled: true },
    wind_speed: { critical: 30, warning: 20, enabled: true }
  });
  const [filter, setFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    generateAlerts();
  }, [data, thresholds]);

  const fetchData = async () => {
    try {
      // Use latest_only=true to generate alerts based on current conditions
      const responseData = await apiService.get('data?latest_only=true');
      const dataArray = Array.isArray(responseData) ? responseData : [];
      setData(dataArray);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch environmental data');
    }
  };

  const generateAlerts = () => {
    const newAlerts = [];
    const timestamp = new Date().toLocaleTimeString();

    data.forEach(location => {
      // AQI Alerts
      if (thresholds.aqi.enabled) {
        if (location.aqi >= thresholds.aqi.critical) {
          newAlerts.push({
            id: `${location.city}-aqi-critical-${Date.now()}`,
            type: 'critical',
            category: 'Air Quality',
            message: `Critical air quality in ${location.city}`,
            details: `AQI level: ${location.aqi} - Hazardous conditions. Avoid outdoor activities.`,
            location: location.city,
            value: location.aqi,
            timestamp,
            icon: '🔴'
          });
        } else if (location.aqi >= thresholds.aqi.warning) {
          newAlerts.push({
            id: `${location.city}-aqi-warning-${Date.now()}`,
            type: 'warning',
            category: 'Air Quality',
            message: `Poor air quality in ${location.city}`,
            details: `AQI level: ${location.aqi} - Unhealthy for sensitive groups.`,
            location: location.city,
            value: location.aqi,
            timestamp,
            icon: '🟡'
          });
        }
      }

      // Temperature Alerts
      if (thresholds.temperature.enabled) {
        if (location.temperature >= thresholds.temperature.critical) {
          newAlerts.push({
            id: `${location.city}-temp-critical-${Date.now()}`,
            type: 'critical',
            category: 'Temperature',
            message: `Extreme heat in ${location.city}`,
            details: `Temperature: ${location.temperature}°C - Heat wave conditions. Stay hydrated.`,
            location: location.city,
            value: location.temperature,
            timestamp,
            icon: '🔥'
          });
        } else if (location.temperature >= thresholds.temperature.warning) {
          newAlerts.push({
            id: `${location.city}-temp-warning-${Date.now()}`,
            type: 'warning',
            category: 'Temperature',
            message: `High temperature in ${location.city}`,
            details: `Temperature: ${location.temperature}°C - Take precautions against heat.`,
            location: location.city,
            value: location.temperature,
            timestamp,
            icon: '☀️'
          });
        }
      }

      // Humidity Alerts
      if (thresholds.humidity.enabled && location.humidity >= thresholds.humidity.critical) {
        newAlerts.push({
          id: `${location.city}-humidity-${Date.now()}`,
          type: 'info',
          category: 'Humidity',
          message: `High humidity in ${location.city}`,
          details: `Humidity level: ${location.humidity}% - May feel uncomfortable.`,
          location: location.city,
          value: location.humidity,
          timestamp,
          icon: '💧'
        });
      }

      // Wind Speed Alerts
      if (thresholds.wind_speed.enabled && location.wind_speed >= thresholds.wind_speed.critical) {
        newAlerts.push({
          id: `${location.city}-wind-${Date.now()}`,
          type: 'warning',
          category: 'Wind',
          message: `Strong winds in ${location.city}`,
          details: `Wind speed: ${location.wind_speed} km/h - Exercise caution outdoors.`,
          location: location.city,
          value: location.wind_speed,
          timestamp,
          icon: '💨'
        });
      }
    });

    // Keep only the latest 50 alerts
    setAlerts(prev => [...newAlerts, ...prev].slice(0, 50));

    // Show toast for critical alerts
    newAlerts.filter(a => a.type === 'critical').forEach(alert => {
      toast.error(alert.message, { duration: 5000 });
    });
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAlertStyle = (type) => {
    switch (type) {
      case 'critical':
        return 'border-red-500 bg-red-50';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      case 'info':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const filteredAlerts = filter === 'all'
    ? alerts
    : alerts.filter(alert => alert.type === filter);

  const clearAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
    toast.success('Alert dismissed');
  };

  const clearAllAlerts = () => {
    setAlerts([]);
    toast.success('All alerts cleared');
  };

  const updateThreshold = (metric, type, value) => {
    setThresholds(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        [type]: parseFloat(value)
      }
    }));
  };

  const toggleMetric = (metric) => {
    setThresholds(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        enabled: !prev[metric].enabled
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Bell className="w-8 h-8 text-red-600" />
              <h1 className="text-3xl font-bold text-gray-800">Environmental Alerts</h1>
              {alerts.length > 0 && (
                <span className="px-3 py-1 bg-red-600 text-white rounded-full text-sm font-semibold animate-pulse">
                  {alerts.length} Active
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <button
                onClick={fetchData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>

              {alerts.length > 0 && (
                <button
                  onClick={clearAllAlerts}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-gray-50 rounded-lg"
            >
              <h3 className="font-semibold text-gray-700 mb-4">Alert Thresholds</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(thresholds).map(([metric, values]) => (
                  <div key={metric} className="bg-white p-3 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-medium capitalize">
                        {metric.replace('_', ' ')}
                      </label>
                      <input
                        type="checkbox"
                        checked={values.enabled}
                        onChange={() => toggleMetric(metric)}
                        className="w-4 h-4"
                      />
                    </div>
                    {values.enabled && (
                      <>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-yellow-600">Warning:</span>
                            <input
                              type="number"
                              value={values.warning}
                              onChange={(e) => updateThreshold(metric, 'warning', e.target.value)}
                              className="w-20 px-2 py-1 border rounded"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-red-600">Critical:</span>
                            <input
                              type="number"
                              value={values.critical}
                              onChange={(e) => updateThreshold(metric, 'critical', e.target.value)}
                              className="w-20 px-2 py-1 border rounded"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Filter Tabs */}
          <div className="flex space-x-2 mb-4">
            {['all', 'critical', 'warning', 'info'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  filter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type} ({alerts.filter(a => type === 'all' || a.type === type).length})
              </button>
            ))}
          </div>

          {/* Alerts List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            <AnimatePresence>
              {filteredAlerts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-gray-500"
                >
                  <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-xl font-semibold">No active alerts</p>
                  <p className="text-sm mt-2">All environmental parameters are within normal ranges</p>
                </motion.div>
              ) : (
                filteredAlerts.map(alert => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-4 rounded-lg border-l-4 ${getAlertStyle(alert.type)} transition-all hover:shadow-lg`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{alert.icon}</span>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            {getAlertIcon(alert.type)}
                            <h3 className="font-semibold text-gray-800">{alert.message}</h3>
                            <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                              {alert.category}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{alert.details}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>📍 {alert.location}</span>
                            <span>🕐 {alert.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => clearAlert(alert.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Alert Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => a.type === 'critical').length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {alerts.filter(a => a.type === 'warning').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Info</p>
                <p className="text-2xl font-bold text-blue-600">
                  {alerts.filter(a => a.type === 'info').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-800">{alerts.length}</p>
              </div>
              <Bell className="w-8 h-8 text-gray-600 opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Alerts;