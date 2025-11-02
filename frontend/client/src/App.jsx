import { useState, useEffect } from 'react';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/data')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Environmental Data</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              {data.length > 0 && Object.keys(data[0]).map(key => (
                <th key={key} className="py-3 px-4 uppercase font-semibold text-sm text-left">{key.replace(/_/g, ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {data.map((row, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                {Object.values(row).map((value, i) => (
                  <td key={i} className="py-3 px-4">{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
