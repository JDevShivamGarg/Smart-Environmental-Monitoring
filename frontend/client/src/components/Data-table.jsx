const DataTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center p-8">No data available.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead className="bg-gray-800 text-white">
          <tr>
            {Object.keys(data[0]).map(key => (
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
  );
};

export default DataTable;
