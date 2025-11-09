import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { MapPin, Thermometer, Wind, Droplets, AlertTriangle } from 'lucide-react';
import apiService from '../utils/apiService';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const Maps = () => {
  const [data, setData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('aqi');
  const [loading, setLoading] = useState(true);

  // Indian states/cities coordinates
  const cityCoordinates = {
    'Delhi': [28.6139, 77.2090],
    'Mumbai': [19.0760, 72.8777],
    'Bangalore': [12.9716, 77.5946],
    'Kolkata': [22.5726, 88.3639],
    'Chennai': [13.0827, 80.2707],
    'Hyderabad': [17.3850, 78.4867],
    'Pune': [18.5204, 73.8567],
    'Ahmedabad': [23.0225, 72.5714],
    'Jaipur': [26.9124, 75.7873],
    'Lucknow': [26.8467, 80.9462],
    'Chandigarh': [30.7333, 76.7794],
    'Bhopal': [23.2599, 77.4126],
    'Patna': [25.5941, 85.1376],
    'Thiruvananthapuram': [8.5241, 76.9366],
    'Bhubaneswar': [20.2961, 85.8245],
    'Srinagar': [34.0837, 74.7973],
    'Amritsar': [31.6340, 74.8723],
    'Visakhapatnam': [17.6868, 83.2185],
    'Surat': [21.1702, 72.8311],
    'Guwahati': [26.1445, 91.7362]
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use latest_only=true to get only the most recent entry per city
        const responseData = await apiService.get('data?latest_only=true');
        // Backend returns {data: [], count: X, ...}, extract the data array
        const dataArray = Array.isArray(responseData)
          ? responseData
          : (responseData.data || []);

        // Data already filtered by backend, just enrich with coordinates and normalize
        const enrichedData = dataArray.map(item => ({
          ...item,
          // Use lat/lon from data if available, otherwise use city coordinates
          coordinates: item.lat && item.lon ? [item.lat, item.lon] : (cityCoordinates[item.city] || [20.5937, 78.9629]),
          // Normalize property names for easier access
          temperature: item.temperature_celsius,
          humidity: item.humidity_percent,
          wind_speed: item.wind_speed_ms * 3.6 // Convert m/s to km/h
        }));

        setData(enrichedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getColorByMetric = (value, metric) => {
    switch (metric) {
      case 'aqi':
        if (value <= 50) return '#00E400';
        if (value <= 100) return '#FFFF00';
        if (value <= 150) return '#FF7E00';
        if (value <= 200) return '#FF0000';
        if (value <= 300) return '#8F3F97';
        return '#7E0023';
      case 'temperature':
        if (value <= 10) return '#0000FF';
        if (value <= 20) return '#00FFFF';
        if (value <= 30) return '#FFFF00';
        if (value <= 35) return '#FF7E00';
        return '#FF0000';
      case 'humidity':
        if (value <= 30) return '#FFD700';
        if (value <= 60) return '#00FF00';
        if (value <= 80) return '#00CED1';
        return '#0000FF';
      case 'wind_speed':
        if (value <= 5) return '#00FF00';
        if (value <= 15) return '#FFFF00';
        if (value <= 25) return '#FF7E00';
        return '#FF0000';
      default:
        return '#808080';
    }
  };

  const getMetricIcon = (metric) => {
    switch (metric) {
      case 'aqi':
        return <AlertTriangle className="w-4 h-4 inline" />;
      case 'temperature':
        return <Thermometer className="w-4 h-4 inline" />;
      case 'humidity':
        return <Droplets className="w-4 h-4 inline" />;
      case 'wind_speed':
        return <Wind className="w-4 h-4 inline" />;
      default:
        return null;
    }
  };

  const getMetricUnit = (metric) => {
    switch (metric) {
      case 'aqi':
        return '';
      case 'temperature':
        return '°C';
      case 'humidity':
        return '%';
      case 'wind_speed':
        return ' km/h';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <MapPin className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">Environmental Map</h1>
            </div>

            <div className="flex items-center space-x-4">
              <label className="font-semibold text-gray-700">Select Metric:</label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="aqi">Air Quality Index</option>
                <option value="temperature">Temperature</option>
                <option value="humidity">Humidity</option>
                <option value="wind_speed">Wind Speed</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <MapContainer
              key={selectedMetric}
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{ height: '600px', width: '100%', borderRadius: '0.5rem' }}
              className="shadow-inner"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {data.map((location, index) => {
                const value = location[selectedMetric];
                const color = getColorByMetric(value, selectedMetric);

                return (
                  <CircleMarker
                    key={index}
                    center={location.coordinates}
                    radius={15}
                    fillColor={color}
                    color="#000"
                    weight={2}
                    opacity={0.8}
                    fillOpacity={0.7}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold text-lg mb-2">{location.city}</h3>
                        <div className="space-y-1">
                          <p className="flex items-center space-x-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            <span>AQI: {location.aqi}</span>
                          </p>
                          <p className="flex items-center space-x-2">
                            <Thermometer className="w-4 h-4 text-red-500" />
                            <span>Temp: {location.temperature?.toFixed(1)}°C</span>
                          </p>
                          <p className="flex items-center space-x-2">
                            <Droplets className="w-4 h-4 text-blue-500" />
                            <span>Humidity: {location.humidity}%</span>
                          </p>
                          <p className="flex items-center space-x-2">
                            <Wind className="w-4 h-4 text-gray-600" />
                            <span>Wind: {location.wind_speed?.toFixed(1)} km/h</span>
                          </p>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>

          {/* Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              {getMetricIcon(selectedMetric)}
              <span className="ml-2">Legend - {selectedMetric.replace('_', ' ').toUpperCase()}</span>
            </h3>
            <div className="flex flex-wrap gap-3">
              {selectedMetric === 'aqi' && (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00E400' }}></div>
                    <span className="text-sm">Good (0-50)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFFF00' }}></div>
                    <span className="text-sm">Moderate (51-100)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FF7E00' }}></div>
                    <span className="text-sm">Unhealthy for Sensitive (101-150)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FF0000' }}></div>
                    <span className="text-sm">Unhealthy (151-200)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8F3F97' }}></div>
                    <span className="text-sm">Very Unhealthy (201-300)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#7E0023' }}></div>
                    <span className="text-sm">Hazardous (300+)</span>
                  </div>
                </>
              )}
              {selectedMetric === 'temperature' && (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#0000FF' }}></div>
                    <span className="text-sm">Cold (≤10°C)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00FFFF' }}></div>
                    <span className="text-sm">Cool (11-20°C)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFFF00' }}></div>
                    <span className="text-sm">Warm (21-30°C)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FF7E00' }}></div>
                    <span className="text-sm">Hot (31-35°C)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FF0000' }}></div>
                    <span className="text-sm">Very Hot (&gt;35°C)</span>
                  </div>
                </>
              )}
              {selectedMetric === 'humidity' && (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFD700' }}></div>
                    <span className="text-sm">Dry (≤30%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00FF00' }}></div>
                    <span className="text-sm">Comfortable (31-60%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00CED1' }}></div>
                    <span className="text-sm">Humid (61-80%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#0000FF' }}></div>
                    <span className="text-sm">Very Humid (&gt;80%)</span>
                  </div>
                </>
              )}
              {selectedMetric === 'wind_speed' && (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00FF00' }}></div>
                    <span className="text-sm">Light (≤5 km/h)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FFFF00' }}></div>
                    <span className="text-sm">Moderate (6-15 km/h)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FF7E00' }}></div>
                    <span className="text-sm">Strong (16-25 km/h)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FF0000' }}></div>
                    <span className="text-sm">Very Strong (&gt;25 km/h)</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maps;