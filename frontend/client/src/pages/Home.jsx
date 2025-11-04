import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Cloud,
  Map,
  TrendingUp,
  Wind,
  Droplets,
  Thermometer,
  ArrowRight,
  Shield,
  Database,
  BarChart3,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Home = () => {
  const [liveStats, setLiveStats] = useState({
    citiesMonitored: 20,
    dataPoints: 0,
    lastUpdate: new Date().toLocaleTimeString(),
    averageAqi: 0
  });

  const [highlightCity, setHighlightCity] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/data');
        const data = response.data;

        const avgAqi = Math.round(
          data.reduce((sum, item) => sum + item.aqi, 0) / data.length
        );

        // Find city with highest AQI for highlight
        const highestAqiCity = data.reduce((prev, current) =>
          prev.aqi > current.aqi ? prev : current
        );

        setLiveStats({
          citiesMonitored: data.length,
          dataPoints: data.length * 5, // 5 metrics per city
          lastUpdate: new Date().toLocaleTimeString(),
          averageAqi: avgAqi
        });

        setHighlightCity(highestAqiCity);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Activity className="w-12 h-12 text-blue-500" />,
      title: 'Real-time Monitoring',
      description: 'Live environmental data updated every 5 minutes from trusted sources',
      link: '/dashboard',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Map className="w-12 h-12 text-green-500" />,
      title: 'Interactive Maps',
      description: 'Visualize environmental conditions across Indian cities',
      link: '/maps',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
      title: 'Smart Alerts',
      description: 'Get notified about hazardous environmental conditions',
      link: '/alerts',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-purple-500" />,
      title: 'Advanced Analytics',
      description: 'Comprehensive statistics and trend analysis',
      link: '/statistics',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const metrics = [
    { icon: <Wind />, label: 'Wind Speed', unit: 'km/h' },
    { icon: <Droplets />, label: 'Humidity', unit: '%' },
    { icon: <Thermometer />, label: 'Temperature', unit: '°C' },
    { icon: <Cloud />, label: 'Air Quality', unit: 'AQI' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-green-500 opacity-90"></div>

        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%']
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse'
            }}
            className="w-full h-full opacity-10"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
              backgroundSize: '60px 60px'
            }}
          />
        </div>

        <div className="relative container mx-auto px-6 py-24 text-center text-white">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-6"
          >
            <Cloud className="w-20 h-20 mx-auto text-white animate-pulse" />
          </motion.div>

          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Welcome to <span className="text-yellow-300">EnviraMonitor</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
          >
            Your comprehensive real-time environmental monitoring solution for a healthier tomorrow
          </motion.p>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 hover:text-blue-800 transition-all transform hover:scale-105 shadow-lg"
            >
              <Activity className="w-6 h-6" />
              <span>View Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/maps"
              className="inline-flex items-center space-x-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105"
            >
              <Globe className="w-6 h-6" />
              <span>Explore Maps</span>
            </Link>
          </motion.div>
        </div>

        {/* Live Stats Bar */}
        <div className="relative bg-black bg-opacity-20 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center"
              >
                <p className="text-3xl font-bold">{liveStats.citiesMonitored}</p>
                <p className="text-sm opacity-90">Cities Monitored</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center"
              >
                <p className="text-3xl font-bold">{liveStats.dataPoints}</p>
                <p className="text-sm opacity-90">Live Data Points</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center"
              >
                <p className="text-3xl font-bold">{liveStats.averageAqi}</p>
                <p className="text-sm opacity-90">Average AQI</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="text-center"
              >
                <p className="text-3xl font-bold">{liveStats.lastUpdate}</p>
                <p className="text-sm opacity-90">Last Update</p>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Alert Banner */}
      {highlightCity && highlightCity.aqi > 150 && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          className="bg-red-600 text-white"
        >
          <div className="container mx-auto px-6 py-3 flex items-center justify-center space-x-2">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <p className="font-semibold">
              Alert: {highlightCity.city} has unhealthy air quality (AQI: {highlightCity.aqi})
            </p>
            <Link to="/alerts" className="underline hover:no-underline">
              View Details
            </Link>
          </div>
        </motion.div>
      )}

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Powerful Features for Environmental Awareness
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Access comprehensive environmental data and insights to make informed decisions
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="relative group"
            >
              <Link to={feature.link}>
                <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 h-full">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`}></div>
                  <div className="relative z-10">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <div className="flex items-center text-blue-600 font-semibold group-hover:text-blue-700">
                      <span>Explore</span>
                      <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Metrics Showcase */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              What We Monitor
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive environmental metrics updated in real-time
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-lg shadow-lg p-6 text-center"
              >
                <div className="text-blue-600 mb-3 flex justify-center">
                  {metric.icon}
                </div>
                <h3 className="font-semibold text-gray-800">{metric.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{metric.unit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Shield className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">
              Stay Informed, Stay Protected
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of users who rely on EnviraMonitor for accurate, real-time environmental data
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 hover:text-blue-800 transition-all transform hover:scale-105 shadow-lg"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Database className="w-12 h-12 mx-auto mb-4 text-gray-600" />
          <h3 className="text-2xl font-bold text-gray-800 mb-8">Powered by Trusted Data Sources</h3>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="bg-white rounded-lg shadow px-6 py-3">
              <p className="font-semibold">WeatherAPI.com</p>
            </div>
            <div className="bg-white rounded-lg shadow px-6 py-3">
              <p className="font-semibold">AQICN.org</p>
            </div>
            <div className="bg-white rounded-lg shadow px-6 py-3">
              <p className="font-semibold">FastAPI</p>
            </div>
            <div className="bg-white rounded-lg shadow px-6 py-3">
              <p className="font-semibold">React</p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
