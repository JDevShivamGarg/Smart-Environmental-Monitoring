import { useState } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Bell, Map, BarChart, Clock, Palette, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState({
    general: {
      autoRefresh: true,
      refreshInterval: 5,
      timezone: 'Asia/Kolkata',
      temperatureUnit: 'celsius',
      language: 'en'
    },
    notifications: {
      enableAlerts: true,
      soundAlerts: false,
      emailAlerts: false,
      pushNotifications: true,
      alertFrequency: 'immediate'
    },
    display: {
      theme: 'light',
      chartType: 'line',
      gridView: false,
      showLegends: true,
      animations: true,
      compactMode: false
    },
    data: {
      historicalDays: 7,
      aggregationInterval: 'hourly',
      includeForecasts: true,
      dataSources: {
        weatherapi: true,
        aqicn: true
      }
    }
  });

  const [activeTab, setActiveTab] = useState('general');

  const handleSave = () => {
    // In a real app, this would save to backend/localStorage
    localStorage.setItem('appSettings', JSON.stringify(settings));
    toast.success('Settings saved successfully!');
  };

  const handleReset = () => {
    const defaultSettings = {
      general: {
        autoRefresh: true,
        refreshInterval: 5,
        timezone: 'Asia/Kolkata',
        temperatureUnit: 'celsius',
        language: 'en'
      },
      notifications: {
        enableAlerts: true,
        soundAlerts: false,
        emailAlerts: false,
        pushNotifications: true,
        alertFrequency: 'immediate'
      },
      display: {
        theme: 'light',
        chartType: 'line',
        gridView: false,
        showLegends: true,
        animations: true,
        compactMode: false
      },
      data: {
        historicalDays: 7,
        aggregationInterval: 'hourly',
        includeForecasts: true,
        dataSources: {
          weatherapi: true,
          aqicn: true
        }
      }
    };
    setSettings(defaultSettings);
    toast.success('Settings reset to defaults');
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const updateDataSource = (source, value) => {
    setSettings(prev => ({
      ...prev,
      data: {
        ...prev.data,
        dataSources: {
          ...prev.data.dataSources,
          [source]: value
        }
      }
    }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <SettingsIcon className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'display', label: 'Display', icon: <Palette className="w-4 h-4" /> },
    { id: 'data', label: 'Data Sources', icon: <Globe className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <SettingsIcon className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="md:w-1/4">
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-gray-50 rounded-lg p-6"
              >
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">General Settings</h2>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-700">Auto Refresh</label>
                          <p className="text-sm text-gray-500">Automatically refresh data</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.general.autoRefresh}
                            onChange={(e) => updateSetting('general', 'autoRefresh', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      {settings.general.autoRefresh && (
                        <div>
                          <label className="font-medium text-gray-700">Refresh Interval (minutes)</label>
                          <select
                            value={settings.general.refreshInterval}
                            onChange={(e) => updateSetting('general', 'refreshInterval', parseInt(e.target.value))}
                            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value={1}>1 minute</option>
                            <option value={5}>5 minutes</option>
                            <option value={10}>10 minutes</option>
                            <option value={15}>15 minutes</option>
                            <option value={30}>30 minutes</option>
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="font-medium text-gray-700">Timezone</label>
                        <select
                          value={settings.general.timezone}
                          onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Asia/Kolkata">India (IST)</option>
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                          <option value="Europe/London">London</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-medium text-gray-700">Temperature Unit</label>
                        <select
                          value={settings.general.temperatureUnit}
                          onChange={(e) => updateSetting('general', 'temperatureUnit', e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="celsius">Celsius (°C)</option>
                          <option value="fahrenheit">Fahrenheit (°F)</option>
                          <option value="kelvin">Kelvin (K)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-medium text-gray-700">Language</label>
                        <select
                          value={settings.general.language}
                          onChange={(e) => updateSetting('general', 'language', e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Notification Settings</h2>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-700">Enable Alerts</label>
                          <p className="text-sm text-gray-500">Receive environmental alerts</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.enableAlerts}
                            onChange={(e) => updateSetting('notifications', 'enableAlerts', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-700">Sound Alerts</label>
                          <p className="text-sm text-gray-500">Play sound for critical alerts</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.soundAlerts}
                            onChange={(e) => updateSetting('notifications', 'soundAlerts', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-700">Email Alerts</label>
                          <p className="text-sm text-gray-500">Send alerts to email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.emailAlerts}
                            onChange={(e) => updateSetting('notifications', 'emailAlerts', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-700">Push Notifications</label>
                          <p className="text-sm text-gray-500">Browser push notifications</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications.pushNotifications}
                            onChange={(e) => updateSetting('notifications', 'pushNotifications', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div>
                        <label className="font-medium text-gray-700">Alert Frequency</label>
                        <select
                          value={settings.notifications.alertFrequency}
                          onChange={(e) => updateSetting('notifications', 'alertFrequency', e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="immediate">Immediate</option>
                          <option value="hourly">Hourly Summary</option>
                          <option value="daily">Daily Summary</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'display' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Display Settings</h2>

                    <div className="space-y-4">
                      <div>
                        <label className="font-medium text-gray-700">Theme</label>
                        <select
                          value={settings.display.theme}
                          onChange={(e) => updateSetting('display', 'theme', e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                          <option value="auto">System Default</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-medium text-gray-700">Default Chart Type</label>
                        <select
                          value={settings.display.chartType}
                          onChange={(e) => updateSetting('display', 'chartType', e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="line">Line Chart</option>
                          <option value="bar">Bar Chart</option>
                          <option value="area">Area Chart</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-700">Grid View</label>
                          <p className="text-sm text-gray-500">Display data in grid layout</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.display.gridView}
                            onChange={(e) => updateSetting('display', 'gridView', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-700">Show Legends</label>
                          <p className="text-sm text-gray-500">Display chart legends</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.display.showLegends}
                            onChange={(e) => updateSetting('display', 'showLegends', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-700">Animations</label>
                          <p className="text-sm text-gray-500">Enable UI animations</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.display.animations}
                            onChange={(e) => updateSetting('display', 'animations', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-700">Compact Mode</label>
                          <p className="text-sm text-gray-500">Reduce spacing and padding</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.display.compactMode}
                            onChange={(e) => updateSetting('display', 'compactMode', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'data' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Source Settings</h2>

                    <div className="space-y-4">
                      <div>
                        <label className="font-medium text-gray-700">Historical Data (days)</label>
                        <select
                          value={settings.data.historicalDays}
                          onChange={(e) => updateSetting('data', 'historicalDays', parseInt(e.target.value))}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={1}>1 day</option>
                          <option value={7}>7 days</option>
                          <option value={14}>14 days</option>
                          <option value={30}>30 days</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-medium text-gray-700">Data Aggregation</label>
                        <select
                          value={settings.data.aggregationInterval}
                          onChange={(e) => updateSetting('data', 'aggregationInterval', e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="realtime">Real-time</option>
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="font-medium text-gray-700">Include Forecasts</label>
                          <p className="text-sm text-gray-500">Show weather forecasts</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.data.includeForecasts}
                            onChange={(e) => updateSetting('data', 'includeForecasts', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="border-t pt-4">
                        <h3 className="font-medium text-gray-700 mb-3">Active Data Sources</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-medium text-gray-600">WeatherAPI.com</label>
                              <p className="text-sm text-gray-500">Weather and forecast data</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.data.dataSources.weatherapi}
                                onChange={(e) => updateDataSource('weatherapi', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="font-medium text-gray-600">AQICN</label>
                              <p className="text-sm text-gray-500">Air quality index data</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.data.dataSources.aqicn}
                                onChange={(e) => updateDataSource('aqicn', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;