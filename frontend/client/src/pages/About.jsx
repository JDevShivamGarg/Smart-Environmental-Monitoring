import { Info, Github, Linkedin, Mail, Heart, Code, Database, Cloud, Shield, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
  const features = [
    {
      icon: <Cloud className="w-8 h-8 text-blue-600" />,
      title: 'Real-time Data',
      description: 'Live environmental data from multiple trusted sources updated every 5 minutes'
    },
    {
      icon: <Database className="w-8 h-8 text-green-600" />,
      title: 'Comprehensive ETL',
      description: 'Automated data pipeline for extracting, transforming, and loading environmental data'
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
      title: 'Interactive Analytics',
      description: 'Advanced visualization and analysis tools for environmental monitoring'
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: 'Alert System',
      description: 'Intelligent alerts for hazardous environmental conditions'
    }
  ];

  const techStack = {
    frontend: ['React', 'Tailwind CSS', 'Recharts', 'Framer Motion', 'React Router', 'Axios'],
    backend: ['FastAPI', 'Python', 'Pandas', 'NumPy', 'Uvicorn'],
    data: ['WeatherAPI.com', 'AQICN', 'Parquet Files'],
    deployment: ['Docker', 'Docker Compose', 'Nginx']
  };

  const team = [
    {
      name: 'Shivam Garg',
      role: 'Full Stack Developer',
      description: 'Passionate about building solutions that make a difference',
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      email: 'shivam@example.com'
    }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-xl p-8 mb-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Info className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-800">About Smart Environmental Monitoring</h1>
          </div>

          <p className="text-lg text-gray-600 mb-6">
            A comprehensive, real-time environmental monitoring system designed to provide critical insights
            into air quality, weather conditions, and environmental health across India. Our platform helps
            individuals, organizations, and policymakers make informed decisions to protect public health
            and the environment.
          </p>

          <div className="flex flex-wrap gap-4">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-semibold">
              Version 2.0
            </span>
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold">
              20+ Cities Monitored
            </span>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full font-semibold">
              Real-time Updates
            </span>
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Tech Stack Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-xl p-8 mb-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Code className="w-8 h-8 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">Technology Stack</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(techStack).map(([category, technologies]) => (
              <div key={category} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
                <h3 className="font-semibold text-lg capitalize text-gray-800 mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {technologies.map((tech, index) => (
                    <div
                      key={index}
                      className="px-3 py-1 bg-white rounded-md text-sm text-gray-700 shadow-sm"
                    >
                      {tech}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg leading-relaxed">
            To democratize access to environmental data and empower communities with the information
            they need to make healthier choices. We believe that everyone has the right to know about
            the quality of the air they breathe and the environmental conditions that affect their
            daily lives. Through technology and innovation, we're making this vital information
            accessible, understandable, and actionable.
          </p>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Development Team</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-all"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="font-semibold text-lg text-gray-800">{member.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{member.role}</p>
                <p className="text-sm text-gray-500 mb-4">{member.description}</p>
                <div className="flex space-x-3">
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href={`mailto:${member.email}`}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Data Sources Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Data Sources & Attribution</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-600 pl-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">WeatherAPI.com</h3>
              <p className="text-gray-600">
                Provides comprehensive weather data including temperature, humidity, wind speed,
                and weather conditions for cities across India.
              </p>
            </div>

            <div className="border-l-4 border-green-600 pl-4">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">AQICN.org</h3>
              <p className="text-gray-600">
                World's leading air quality data platform providing real-time AQI data from
                monitoring stations worldwide.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contributing Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-gray-900 text-white rounded-lg shadow-xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Contributing</h2>
          <p className="mb-6">
            This is an open-source project and we welcome contributions! Whether you're fixing bugs,
            adding new features, or improving documentation, your help is appreciated.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
            >
              <Github className="w-5 h-5" />
              <span>View on GitHub</span>
            </a>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Report an Issue
            </button>
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
              Request Feature
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center py-8"
        >
          <p className="text-gray-600 flex items-center justify-center space-x-2">
            <span>Made with</span>
            <Heart className="w-5 h-5 text-red-600 fill-current" />
            <span>for a cleaner, healthier environment</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            © 2024 Smart Environmental Monitoring System. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default About;