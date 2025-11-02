import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Chart = ({ data, dataKey, title, color, type = 'line', xAxisKey = 'ingestion_timestamp' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <div className="text-center text-gray-500">No data available for chart.</div>
      </div>
    );
  }

  const chart = type === 'line' ? (
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xAxisKey} tickFormatter={timeStr => new Date(timeStr).toLocaleTimeString()} />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey={dataKey} stroke={color} activeDot={{ r: 8 }} />
    </LineChart>
  ) : (
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xAxisKey} />
      <YAxis />
      <Tooltip />
      <Bar dataKey={dataKey} fill={color} />
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
