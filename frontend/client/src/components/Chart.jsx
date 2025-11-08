import { LineChart, Line, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useState } from 'react';

const Chart = ({ data, dataKey, title, color, type = 'line', xAxisKey = 'ingestion_timestamp' }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <div className="text-center text-gray-500">No data available for chart.</div>
      </div>
    );
  }

  // Custom tooltip to show city name and value
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-800">
            {data.city || data[xAxisKey]}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">{title.split('(')[0].trim()}:</span>{' '}
            <span className="font-bold" style={{ color: color }}>
              {payload[0].value}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const chart = type === 'line' ? (
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip content={<CustomTooltip />} />
      <Line type="monotone" dataKey={dataKey} stroke={color} activeDot={{ r: 8 }} />
    </LineChart>
  ) : (
    <BarChart data={data} onMouseLeave={() => setHoveredIndex(null)}>
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip content={<CustomTooltip />} />
      <Bar
        dataKey={dataKey}
        onMouseEnter={(_, index) => setHoveredIndex(index)}
      >
        {data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={color}
            style={{
              filter: hoveredIndex === index ? `drop-shadow(0 0 8px ${color})` : 'none',
              transition: 'filter 0.2s ease',
              cursor: 'pointer'
            }}
          />
        ))}
      </Bar>
    </BarChart>
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <ResponsiveContainer width="100%" height={300}>
        {chart}
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
